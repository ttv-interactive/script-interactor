import { Client, ChatUserstate } from 'tmi.js'

export interface IClient {
        username    : string,
        oauth       : string
        channel     : string
}
export interface ISettings{
    client      : IClient,
    prefix      : string,
    cooldown    : number,
    points      : {
        enabled: boolean,
        payrate: number,
        interval: number
    },
    executions  : IExecutionConfig[]
}

export interface IExecutionConfig {
    ext         : string,
    shell       : string
}

export interface IContext {
    client      : Client,
    channel     : string,
    userstate   : ChatUserstate,
    message     : string,
    self        : boolean
}

export interface ICommand {
    name    : string,
    args    : string[]
}

export interface IDatabaseUser {
    id          : number,
    username    : string,
    points      : number,
}

export interface IScript {
    enabled             : boolean,
    name                : string,
    file                : string,
    // Points cost
    cost?               : number,
    args?               : boolean, 
    argsError?          : string,
    cooldown?           : number,
    followerOnly?       : boolean,
    subscriberOnly?     : boolean,
    moderatorOnly?      : boolean,
    // Last execution time will be added to the script after its first execution. To handle cooldowns.
    lastExecutionTime?  : number
}
