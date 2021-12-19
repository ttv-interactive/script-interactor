enum StatusTypes {
    None,
    Infomation,
    Success,
    Failure,
    Data
}

export default class Logger {

    static logs = []
    // Define the enumerator so it can be used in the class
    static StatusTypes = StatusTypes;

    static log(message : string, status : StatusTypes = StatusTypes.Infomation) {
        // 1 : Information
        // 2 : Success
        // 3 : Failure
        // 4 : Data
        const statusFormats = {
            0: '',
            1: '\x1b[43m \x1b[0m',
            2: '\x1b[42m \x1b[0m',
            3: '\x1b[41m \x1b[0m',
            4: '\x1b[45m \x1b[0m'
        }
        const date = new Date().toTimeString().split(' ')[0]
        // \x1b[0m is used to reset the color
        const log = `${date} ${statusFormats[status]} ${message}`
        // Print the log and add it to the static logs list
        console.log(log)
        this.logs.push(log)
    }
}