import * as fs from 'fs';
import { Logger } from '../utils';
import { IScript, ISettings} from '../types';
import ScriptHandler from './script-handler';
export default class FileHandler {

    private static createFolder(path : string) : boolean {
        try {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path)
                Logger.log(`${path} - created folder successfully!`, Logger.StatusTypes.Infomation);
                return true
            }
            return false
        } catch(error) {
            Logger.log(`${path} - failed to create folder\n${error}`, Logger.StatusTypes.Failure)
        }
        return null
    }

    static directories = {
        config  : './config',
        scripts : './scripts'
    }

    static config = {
        settings:   `${this.directories.config}/settings.json`,
        scripts:    `${this.directories.config}/scripts.json`,
    }

    static files = {
        obs:        'obs.txt'
    }

    static scripts  : IScript[] = null
    static settings : ISettings = null

    static Initialize() : void {
        // Create the necessary folder
        this.createFolder(this.directories.config)
        this.createFolder(this.directories.scripts)

        // Create the settings configuration file
        if (!fs.existsSync(this.config.settings)) {
            const data : ISettings = {
                client: {
                    username: "",
                    oauth: "",
                    channel: ""
                },
                prefix: '!',
                cooldown: 30,
                points: {
                    enabled: false,
                    payrate: 100,
                    interval: 30
                },
                executions :  [
                    {
                        ext: '.ahk',
                        shell: 'C:/Program Files/AutoHotkey/autohotkey.exe',
                    },
                    {
                        ext: '.py',
                        shell: 'python'
                    }
                ]
            }
            this.writeJson(this.config.settings, data)
        }

        // Create the scripts configuration file
        if (!fs.existsSync(this.config.scripts)) {
            // No default scripts is loaded so create empty file
            this.writeJson(this.config.scripts, [])
        }

        // Load the configuration
        this.settings   = this.readJson(this.config.settings)
        this.scripts    = this.readJson(this.config.scripts)
    }

    static validate() : boolean {
        // Read client config
        if (!this.settings) {
            return false
        } else {
            if (this.settings.client.username   == '' ||
                this.settings.client.oauth      == '' ||
                this.settings.client.channel    == '') {
                    return false
            }
        }
        // Validate the scripts
        ScriptHandler.validateScripts() 

        return true
    }

    static async writeJson(path : string, data : any) {
        return new Promise((resolve, reject) => {
            try {
                const json = JSON.stringify(data, null, 4)
                fs.writeFileSync(path, json);
                Logger.log(`${path} - wrote data`, 1)
                resolve(json)
    
            } catch(error) {
                Logger.log(`${path} - failed to write data\n${error}`, Logger.StatusTypes.Failure)
                reject(error)
            }
        })
    }

    static readJson(path : string) : any {
        try {
            if (fs.existsSync(path)) {
                const data = fs.readFileSync(path);
                return JSON.parse(data.toString())
            } else {
                Logger.log(`${path} - file does not exist`, Logger.StatusTypes.Failure)
            }
        } catch (error) {
            Logger.log(`${path} - failed to read\n${error}`, Logger.StatusTypes.Failure)
        }
        return null
    }
}