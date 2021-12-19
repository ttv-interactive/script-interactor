import { FileHandler } from './helpers'
import { Bot } from './app'

console.log(`
  ____            _       _   
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
 Discord for issues & help  https://discord.gg/MZyktMG`)

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
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
}

