import * as tmi from 'tmi.js'
import { ISettings, ICommand, IContext } from '../types'
import { ScriptHandler, FileHandler } from '../helpers'
import { Logger } from '../utils'
import  commands  from './commands'
import DBConnection from '../helpers/db-connection'

export default class Bot {
    
    private client      : tmi.Client
    private isRunning   : boolean = true

    private viewers : string[] = []

    public constructor(settings : ISettings) {
        // Format the settings so the tmi.client can read it
        this.client = tmi.client({
            identity: {
                username: settings.client.username,
                password: settings.client.oauth
            },
            channels: [settings.client.channel]
        })

        // Enable the points system
        if (settings.points.enabled) {
            // Get the settings of the point system
            const payrate   = settings.points.payrate
            const interval  = settings.points.interval

            setInterval(() => {
                this.viewers.forEach(username => {
                    DBConnection.editPoints(username, payrate, DBConnection.editTypes.Add)
                })
                // Interval in minutes
            }, interval * 60000)
        }
    }

    public start() : void {
        // Set the client EVENTS
        this.client.on('connecting', () => {
            Logger.log("Establishing connection...", Logger.StatusTypes.Infomation)
        })

        this.client.on('connected', () => {
            Logger.log('Connected', Logger.StatusTypes.Success)
        })

        // If a user joins the channel - we add them to the list of viewers
        // If they leave - we remove them from the list
        this.client.on('join', (channel, username, self) => {
            // If its the bot or the streamer itself - return
            // '#' is included in the channel name - example: #BigBootyStreamer68
            if (self || channel.replace('#', '') == username) { return }

            if (!this.viewers.includes(username)) {
                this.viewers.push(username);

            }
            Logger.log(`${username} joined`, Logger.StatusTypes.Infomation);
        });
        
        this.client.on('part', (channel, username, self) => {
            // If its the bot or the streamer itself - return
            // '#' is included in the channel name - example: #BigBootyStreamer70
            if (self || channel.replace('#', '') == username) { return }

            const index = this.viewers.indexOf(username);
            if (index > -1){
                this.viewers.splice(index, 1);
            }
            Logger.log(`${username} left`, Logger.StatusTypes.Infomation);
        });


        this.client.on('message', (channel, userstate, message, self) => {
            // Only handle the messages if the bot isn't stopped
            if (this.isRunning) {
                // return if message is from the bot itself
                if (self) return

                // Create the context of the message that we will use when we handle the message later
                const context : IContext = {
                    client:     this.client,
                    channel:    channel,
                    userstate:  userstate,
                    message:    message,
                    self:       self
                }

                // Check if the message starts with the prefis
                if (message[0] == FileHandler.settings.prefix) {
                    const message_array = context.message.split(' ')
    
                    const command : ICommand = {
                        // Get the action and remove the prefix
                        name    : message_array[0].replace(FileHandler.settings.prefix, ''),
                        args    : message_array.slice(1)
                    }
                    // Log the message to the console
                    Logger.log(`${userstate.username}: ${FileHandler.settings.prefix}${command.name} ${command.args.length !== 0 ? '[ ' + command.args.join(', ') + ' ]' : ''}`, Logger.StatusTypes.Data)
                
                    this.handleCommand(context, command)
                }
            }
        })

        // Connect to Twitch
        this.client.connect().catch((err) => {
            Logger.log(err, 3);
        })
    }  

    private async handleCommand(context : IContext, command : ICommand ){

        // Check if the command is one of the integrated commands
        for (const _command of commands) {
            if (_command.name.toLowerCase() == command.name.toLowerCase()) {
                _command.action(context, command.args)
                Logger.log(`Executing ${_command.name} command for user ${context.userstate.username}`, Logger.StatusTypes.Infomation)
                return
            }
        }

        // If not one of the integrated commands check the scripts
        for (const script of FileHandler.scripts) {
            if (script.name.toLowerCase() == command.name.toLowerCase()) {
                ScriptHandler.ExecuteScript(script, context, command)
            }
        }
    }
}