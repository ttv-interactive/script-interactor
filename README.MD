
<img src="https://github.com/ttv-interactive/docs/blob/main/script-interactor/images/header.png?raw=true">
<p align="center">
    <b>Script Interactor</b>
    <br>
    Version: <b>1.0.1</b>
    <br>
    <a href="#Requirements">Requirements</a> •
    <a href="#Installation">Installation</a> •
    <a href="#Setup">Setup</a> •
    <a href="#Documentation">Documentation</a> •
    <a href="#Resources">Resources</a> •
    <a href="#Issues">Issues</a> •
    <a href="#License">License</a>
</p>

# About
Script Interactor is a Twitch chatbot built in Node JS.  
It encourages your viewers to interact with your Twitch stream by letting them execute scripts, where you as the broadcaster are the target.  
You could for example configure the application to run a script whenever a viewer types !reverse - which could result in your keyboard input turning reversed or you could configure a script to spawn enemies around you. The possibilies are up to you.  
Currently the applicaton can only be run on Windows machines.

* How does it work?  
You configure scripts to be run by chat commands. By adding a script to the ``./scripts`` folder and configuring it in the ``./config/scripts.json``, you allow your viewers to run scripts on your system by typing commands in the chat.  
These scripts can be configured to your liking with cooldown timer, points cost, permissions etc. in the ``config/scripts.json``.  
  
## Requirements
* [Node](https://nodejs.org/en/) Will be used to run the program and install the necessary modules.  
Note: if you plan using the executable this will not be needed.
* [Python](https://www.python.org/downloads/) Will be used to execute Python scripts.  
Note: Remember to add Python to the system path, during the instillation.
* [AutoHotkey](https://www.autohotkey.com/) Will be used to execute AutoHotkey scripts.


## Installation
* Cloning the repository  

This require [Node](https://nodejs.org/en/) and [Git](https://git-scm.com/downloads) and installed.  
`git clone https://github.com/viktorholk/script-interactor` in your terminal, with [Git](https://git-scm.com/downloads) installed.  
You can also download the repository as a .zip file [here](https://github.com/ttv-interactive/script-interactor/archive/refs/heads/main.zip)  

Goto `./src` and type `npm install` in your terminal to install the necessary modules.  
Type `npm start` to run the application.  

You can skip this by downloading the latest [release](https://github.com/ttv-interactive/script-interactor/releases).

## Setup
Run the application first to create the necessary config files.  
Open the `settings.json` in your config folder.  
It will look something like this:
````
{
    "client": {
        "username": "",     // USERNAME OF YOUR BOT
        "oauth": "",        // OAuth TOKEN FOR YOUR BOT
        "channel": ""       // THE CHANNEL THE BOT WILL LISTEN IN
    },
    "prefix": "!",          // THE PREFIX OF THE BOT COMMANDS
    "cooldown": 5,          // THE GLOBAL COOLDOWN FOR ALL SCRIPTS
    ...
````
Fill in your bot's credentials.
* Getting an OAuth token  
  Go to [twitchapps.com/tmi/](https://twitchapps.com/tmi/) to generate your token.  
  **DO NOT SHARE THIS TOKEN WITH ANYONE**

Remember that each time you change the configuration or add new scripts, restart the application.
### Administrative Privileges
The appliation requires to be run as administrator.  
This is because a lot of the scripts will not be working as intended otherwise.
* Enable administrator privileges for the exectuable  
Right click on the executable, go to the compatibility page and enable `Run this program as an administrator` under the settings.  
![run-as-administrator.png](https://github.com/ttv-interactive/docs/blob/main/script-interactor/images/run-as-administrator-exe.png?raw=true)
* Enable administrator privileges for the terminal  
If you're running the applicaton through the terminal. The terminal has to also be run with elevated privileges.  
When opening the terminal make sure you right click and `Run as administrator`  

For further documentation check these links.
## Documentation
* [Scripts](https://github.com/ttv-interactive/docs/blob/main/script-interactor/SCRIPTS.MD)
* [OBS](https://github.com/ttv-interactive/docs/blob/main/script-interactor/OBS.MD)
* [Point system](https://github.com/ttv-interactive/docs/blob/main/script-interactor/POINTS-SYSTEM.MD)
## Issues
Please report issues using [GitHub's issues tab](https://github.com/ttv-interactive/script-interactor/issues), or in the [Discord](https://discord.gg/VEDrsqCn2D).
## License
Script Interactor is under the [MIT LICENSE](LICENSE).