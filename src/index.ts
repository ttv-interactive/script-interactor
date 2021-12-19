import { FileHandler } from './helpers'
import { Bot } from './app'
import { execSync } from 'child_process'
import { Logger } from './utils';
console.log(`  ____            _       _   
 / ___|  ___ _ __(_)_ __ | |_ 
 \\\___ \\\ / __| '__| | '_ \\\| __|
  ___) | (__| |  | | |_) | |_ 
 |____/ \\\___|_|  |_| .__/ \\\__|
  ___       _      |_|             _             
 |_ _|_ __ | |_ ___ _ __ __ _  ___| |_ ___  _ __ 
  | || '_ \\\| __/ _ \\\ '__/ _ |/ __| __/ _ \\\| '__|
  | || | | | ||  __/ | | (_| | (__| || (_) | |   
 |___|_| |_|\\\__\\\___|_|  \\\__,_|\\\___|\\\__\\\___/|_|  

 Version 1.0.0              by viktorholk
 Discord for issues & help  https://discord.com/invite/VEDrsqCn2D`)

// Function for blocking the application and waiting for input
// This is used when we don't want the application to close right after a error message prints
 function block(){
    console.log('Press any key to continue...')
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
 }

// Check if the application is run in elevated privileges (Run as adminitrator)
let elevated = false
try {
    // This command will raise an exception if the application is not run with elevated privileges
    // The command is reads if the disk is dirty - unharmful
    execSync('fsutil dirty query C:')
    elevated = true
} catch(e) {
    Logger.log('This application requires to be run as administrator\nGoto \x1b[33mhttps://github.com/ttv-interactive/script-interactor#administrative-privileges\x1b[0m for more infomation.', Logger.StatusTypes.Failure)
    block()
}

if (elevated) {
    // Validate the config before starting the bot
    FileHandler.Initialize()
    
    if (FileHandler.validate()) {
        // Initialize the bot and start it
        const bot = new Bot(FileHandler.settings)
        bot.start()
    } else {
        // There hasen't been made any configuration to the settings.json
        // If opened as executable the program will just exist without prompting the user with the necessary changes
        // wait for user input before closing the terminal:
        Logger.log(`Configure ${FileHandler.config.settings} with your credentials`, Logger.StatusTypes.Failure);
        Logger.log('username    : "<Your Twitch bot username>"', Logger.StatusTypes.None);
        Logger.log('password    : "<Your OAuth bot token>"', Logger.StatusTypes.None);
        Logger.log('channel     : "<Your Twitch username>"', Logger.StatusTypes.None);
        block()
    }
}

