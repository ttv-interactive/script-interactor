import * as fs from 'fs';
import { exec } from "child_process";
import path from "path/posix";
import Api from "./api-handler";
import { Logger } from "../utils";
import FileHandler from "./file-handler";
import DBConnection from "./db-connection";
import { IScript, IExecutionConfig, IContext, ICommand } from "../types";

export default class ScriptHandler{

    private static lastExecutedScriptTime = null

    private static currentRunningScripts = []

    private static UpdateExecutingScripts(currentRunningScripts : string[]): void {
        // Add the executing script to the OBS.txt file
        try {
            fs.writeFileSync(FileHandler.files.obs, currentRunningScripts.join('\n'));
        } catch (error) {
            Logger.log(`Something went wrong writing script to ${FileHandler.files.obs}\n${error}`, Logger.StatusTypes.Failure)
        }
    }

    static async ExecuteScript(script: IScript, context: IContext, command: ICommand){
        if (script.enabled) {

            // Load the settings
            const settings = FileHandler.settings

            const userstate = context.userstate

            // Check if the script is moderator, subscriber or follower only
            // We will check for moderator and subscriber first it doesn't require an API call
            // Exclude the streamer from being checked
            if (context.userstate.username !== settings.client.channel) {
                if (script.moderatorOnly && !userstate.mod) {
                    Logger.log(`${userstate.username} tried to execute mod only script`, Logger.StatusTypes.Failure)
                    return
                }
    
                if (script.subscriberOnly && !userstate.subscriber){
                    Logger.log(`${userstate.username} tried to execute subscriber only script`, Logger.StatusTypes.Failure)
                    return
                }
                // If the streamer is executing the script, we don't want to check follow status
                if (context.userstate.username !== settings.client.channel) {
                    if (script.followerOnly && !await Api.isFollowing(userstate['user-id'])) {
                        Logger.log(`${userstate.username} tried to execute follower only script`, Logger.StatusTypes.Failure)
                        return
                    }
                }
                // If the point system is enabled check whether the user has enough points
                // Skip the points system if the command is from the streamer
                if (settings.points.enabled && script.cost > 0) {
                    const user = await DBConnection.getUser(userstate.username)
                    if (user) {
                        if (user.points >= script.cost) {
                            console.log(user.points)
                            console.log(script.cost)
                            DBConnection.editPoints(userstate.username, script.cost, DBConnection.editTypes.Remove)
                        } else {
                            context.client.say(context.channel, `@${userstate.username}, sorry you don't have enough points. Points needed: ${script.cost}`)
                            return
                        }
                    }
                }
            }

            // Get the time of the execution -- this is used when we have to check on the cooldown of the script
            const time          = new Date().getTime()
            const scriptPath    = path.join(FileHandler.directories.scripts, script.file)
            const scriptExt     = path.extname(scriptPath)

            // Check if the extension is a valid execution method
            const executionIndex = settings.executions.findIndex(( i : IExecutionConfig ) => i.ext === scriptExt)
            if (executionIndex > -1) {
                // Check if there is global cooldown and there previous has been executed a script
                if (settings.cooldown > 0 && this.lastExecutedScriptTime) {

                    // Check if we have exceeded the global cooldown
                    const timePassed          = (time - script.lastExecutionTime) / 1000
                    const remainingTime         = settings.cooldown - timePassed

                    if (timePassed < settings.cooldown) {
                        context.client.say(context.channel, `@${userstate.username}, Sorry! scripts are currently on a cooldown ${remainingTime.toFixed(1)} s`)
                        Logger.log(`Scripts are currently on cooldown ${remainingTime.toFixed(1)}s remaining`, Logger.StatusTypes.Infomation);

                        // Stop the script from executing
                        return
                    } else {
                        // Check if the current script is on a cooldown
                        // Check if the lastExecutionTime is present and the script is ready to run again after cooldown
                        if (script.lastExecutionTime) {

                            const previousTime          = (time - script.lastExecutionTime) / 1000
                            const remainingTime         = script.cooldown - previousTime

                            if (previousTime < script.cooldown ) {
                                context.client.say(context.channel, `@${userstate.username}, Sorry! ${script.name} is on cooldown ${remainingTime.toFixed(1)} s`)
                                Logger.log(`${script['file']} is on cooldown ${remainingTime.toFixed(1)}s remaining`, Logger.StatusTypes.Infomation);

                                // Stop the script from executing
                                return
                            }
                        }
                    }
                }

                const executionMethod = settings.executions[executionIndex]
                let shell = ''
                // Sometimes we have to use quotes around the shell command if it is a path or already in the windows path
                // That is why we match the basename
                if (executionMethod.shell == path.basename(executionMethod.shell)) {
                    // Dont use quotes around the shell path
                    shell = `${executionMethod.shell} ${scriptPath}`
                } else {
                    shell = `"${executionMethod.shell}" ${scriptPath}`
                }
                // Add the args if any
                if(script.args) {
                    if (command.args.length > 0) {
                        // Add the arguments to the shell
                        shell += ' ' + command.args.join(' ')
                    } else {
                        // Return if the user didn't provide any arguments
                        context.client.say(context.channel, script.argsError)
                        return
                    }
                }
                // Write to the chat
                context.client.say(context.channel, `Executing script ${script.name}`)
                // Add the script to currentRunningScripts and add it to the obs.txt file
                Logger.log(`Executing script ${script.name}`, Logger.StatusTypes.Infomation)

                this.currentRunningScripts.push(script.name)
                this.UpdateExecutingScripts(this.currentRunningScripts)

                // Update the execution of the script so we can cooldown check when it gets executed again
                // Both lastExecutedScriptTIme & script.lastExecutionTime
                script.lastExecutionTime = this.lastExecutedScriptTime = time
                // Execute the script
                const process = exec(shell, (error, stdout) => {

                    if (error) {
                        Logger.log(`Something went wrong executing ${scriptPath}\n${error}`, Logger.StatusTypes.Failure)
                    }
                    if (stdout.length > 0) {
                        Logger.log(`[${script.name}] ${stdout}`, Logger.StatusTypes.Data)
                    }
                })

                process.on('exit', () => {
                    Logger.log(`Script ${script.name} finished`, Logger.StatusTypes.Infomation)

                    // Set timeout so even fast scripts will show up on the screen
                    setTimeout(() => {
                        // Remove the script from the obs.txt file
                        const scriptIndex = this.currentRunningScripts.indexOf(script.name)
                        if (scriptIndex > -1) {
                            this.currentRunningScripts.splice(scriptIndex, 1)
                        }
                        // Update the txt file
                        this.UpdateExecutingScripts(this.currentRunningScripts)
                    }, 2000);
                })
            }
        }
    }
    
    static validateScripts(){
        // We have to both check the script files and their corresponding metadata
        // If there is a file without being in the config - we will create a new metadata entry for the script
        // If there is metadata for a script but the script has been deleted from the scripts foler - we will remove it

        // Get the script files
        const files = fs.readdirSync(FileHandler.directories.scripts)

        // If there has been any updates - we will set this varaible to true and we will write the new data to the configuration after the validation
        let update = false

        // Go through all the files and check if there is a matching metadata entry for the script
        // If not create a new metadata
        for (const file of files) {

            const filePath = path.join(FileHandler.directories.scripts, file)
            // If the file is a directory - continue
            if (fs.lstatSync(filePath).isDirectory()) {
                continue
            }

            // If the extension isn't in the settings - continue
            if (!FileHandler.settings.executions.map(i => i.ext).includes(path.extname(file))) continue

            // Check if the script is included in the scripts configuraton file
            if (!FileHandler.scripts.map(i => i.file).includes(file)) {
                // Create a new default metadata for the script
                const metadata : IScript = {
                    enabled:        true,
                    name:           path.parse(file).name,
                    file:           file,
                    cost:           0,
                    args:           false,
                    argsError:      "This is the message that will be sent to the viewer - if arguments are enabled and the viewer didn't use them",
                    cooldown:       0,
                    followerOnly:   true,
                    subscriberOnly: false,
                    moderatorOnly:  false
                }
                // Add the metadata to the memory
                FileHandler.scripts.push(metadata)
                Logger.log(`Added default metadata for script ${metadata.name}`, Logger.StatusTypes.Infomation)

                update = true
            }
        }
        // Go through the metadata of the scripts - and if there is metadata for a script isn't present in the scripts folder - remove it
        const metadataFiles = FileHandler.scripts.map(i => i.file)
        for (const file of metadataFiles) {

            const filePath = path.join(FileHandler.directories.scripts, file)
            // Check if the file exists
            if (!fs.existsSync(filePath)) {
                // Remove the metadata
                const index = metadataFiles.indexOf(file)
                if (index > -1) {
                    FileHandler.scripts.splice(index, 1)
                    Logger.log(`Removed metadata for non-existing script ${file}`)

                    update = true
                }
            }
        }
        // If there has been any updates - write the new data
        if (update) FileHandler.writeJson(FileHandler.config.scripts, FileHandler.scripts)
    }
}