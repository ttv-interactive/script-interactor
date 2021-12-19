import DBConnection from '../../helpers/db-connection'
import { IContext } from '../../types'

interface IAppCommand {
    name : string,
    action: (context : IContext, args? : string[]) => void
}

const integratedCommands : IAppCommand[] = [
    {
        name : 'help',
        action : (context : IContext) => {
            context.client.say(context.channel, `${context.userstate.username}, here is the available Script Interactor commands: !scripts, !points`)
        }
    },
    {
        name : 'points',
        action : (context : IContext) => {
            DBConnection.getUser(context.userstate.username, (user) => {
                // If the user hasen't been registred in the database yet, user will be undefined
                // Just put the amount to 0 - The user will get registred when the points gets rewarded
                const amount = (user) ? user.points : 0
                context.client.say(context.channel, `@${context.userstate.username}, you have ${amount} points. `)
            })
        }
    }
] 

export default integratedCommands

