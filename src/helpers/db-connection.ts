import sqlite3, { Database } from 'sqlite3'
import { IDatabaseUser } from '../types'
import { Logger } from '../utils'

enum editTypes{
    Add,
    Remove
}


export default class DBConnection {

    private static connection = this.initialize()

    private static initialize() : Database{
        const fileName = 'db.sqlite3'

        const connection = new sqlite3.Database(fileName, (err) => {
            if (err) {
                Logger.log(err.message, Logger.StatusTypes.Failure)
            }
        })

        // Create the tables
        connection.serialize(() => {
            connection.run(`CREATE TABLE IF NOT EXISTS points (
                id INTEGER PRIMARY KEY,
                username VARCHAR(25) NOT NULL,
                points INTEGER DEFAULT 0)`)
        });

        return connection
    }

    // Use the editTypes enum in the class - public
    static editTypes = editTypes

    static editPoints(username : string, points : number, editType : editTypes) : void{
        this.connection.serialize(() => {
            this.connection.get(`SELECT * FROM points WHERE username="${username}"`, (err, row) => {
                if (err){
                    Logger.log(err.message, Logger.StatusTypes.Failure)
                    return
                }

                if (row){
                    // Get the amount whether we want to add new points or remove
                    let amount = null
                    if (editType == editTypes.Add) {
                        amount = row.points + points;
                    } else if (editType == editTypes.Remove) {
                        amount = ((row.points - points) >= 0) ? row.points - points : 0;
                    }

                    // Update the points
                    this.connection.run(`UPDATE points SET points=${amount} WHERE username="${username}"`);
                    Logger.log(`${ editType == editTypes.Add ? 'Added' : 'Removed' } ${points} points to ${username}`, Logger.StatusTypes.Infomation)
                } else {
                    // create the new user row
                    this.connection.run(`INSERT INTO points (username) VALUES ("${username}")`)

                    // Add new points if the editType is add
                    if (editType == editTypes.Add) {
                        this.connection.run(`UPDATE points SET points=${points} WHERE username="${username}"`);
                        Logger.log(`Added ${points} points to ${username}`, Logger.StatusTypes.Infomation)
                    }
                }
            })
        })
    }

    static async getUser(username : string) {
        return new Promise<IDatabaseUser>((resolve,reject) => {
            this.connection.serialize(() => {
               this.connection.get(`SELECT * FROM points where username="${username}"`, (err, row : IDatabaseUser) => {
                   if (err){
                       Logger.log(`There was an error retriving the data of ${username}`, Logger.StatusTypes.Failure);
                    }
                    resolve(row);
                });
            });
        })
    }
}