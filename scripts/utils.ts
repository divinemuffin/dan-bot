const chalk = require('chalk');

export class DanConsole {
    public constructor(enableLogs: boolean = false) {
        this.enableLogs = enableLogs;
    }

    private enableLogs: boolean;

    public error = function (...args) {
        const title = chalk.bgRed.black('[DAN] >> Error: ');
        console.error(title, chalk.red(...args));
    };

    public warn = function (...args) {
        if (this.enableLogs) {
            const title = chalk.bgYellow.black('[DAN] >> Warning: ');
            console.warn(title, chalk.yellow(...args));
        }
    };

    public info = function (...args) {
        if (this.enableLogs) {
            const title = chalk.bgCyan.black('[DAN] >> FYI: ');
            console.info(title, chalk.cyan(...args));
        }
    };
}
