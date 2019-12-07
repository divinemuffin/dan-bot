const chalk = require('chalk');
const minimist = require('minimist');

export class DanConsole {
    public constructor(enableLogs: boolean = false) {
        this.enableLogs = enableLogs;
    }

    private enableLogs: boolean;

    public error = function (...args: Array<string | Object>) {
        const title = chalk.bgRed.black('[DAN] >> Error: ');
        const message: any = args.shift();
        const error = new Error(message);
        const stackLogs = error.stack.split('\n');
        console.error(`\n\nLogs: ${error.stack}\n\n`)
        console.error(`${title} ${chalk.red(stackLogs[2].trim())} ${error.message}\n`);
    };

    public warn = function (...args: Array<string | Object>) {
        if (this.enableLogs) {
            const title = chalk.bgYellow.black('[DAN] >> Warning: ');
            console.warn(title, chalk.yellow(...args));
        }
    };

    public info = function (...args: Array<string | Object>) {
        if (this.enableLogs) {
            const title = chalk.bgCyan.black('[DAN] >> FYI: ');
            console.info(title, chalk.cyan(...args));
        }
    };
}

export class DanUtils {

    /**
     * Suppose you have Array of objects and you need Array with their values. This function does that
	 *
	 * @param {array} array - An array of any iterable objects to flatten
	 * @returns {array} flattened array of values
     * @example
     *      flattenArrayOfObjects[{.}, {.}, {.}] => [...]
     */

    public flattenArrayOfObjects(array: Array<{[key:string]: any}>): Array<any> {
        return array.reduce((acc, val) => {
            if (Array.isArray(val)) {
                return acc.concat(this.flattenArrayOfObjects(val));
            } else if (typeof val === 'object') {
                const temp = [];
                for (let valKey in val) {
                    if (typeof val[valKey] === 'object') {
                        return acc.concat(this.flattenArrayOfObjects([val[valKey]]));
                    }
                    temp.push(`${valKey}: ${val[valKey]}`)
                }
                return acc.concat(temp)
            } else {
                return acc.concat(val)
            }
        }, []);
    }


    public parseCommand(string: string) {
        const command = string.split(' ');
        const base = command.shift();

        return {
            base,
            parameters: minimist(command)
        }
    }
}

export class DanMemory {
    public allowedParams = ['rating', 'order', 'frequency'];

    public set(parameter: {[key: string]: string}): void {
        const lastSetting = this.getAll();
        const parKey = Object.keys(parameter)[0];
        console.log('Saving: ', parKey, parameter[parKey]);

        process.env.DAN_SETTING = JSON.stringify({
            ...lastSetting,
            [parKey]: parameter[parKey]
        });
    }

    public get(value: string): string {
        return JSON.parse(process.env.DAN_SETTING)[value];
    }

    public getAll(): {[key: string]: string} {
        console.log('Getting all: ', process.env.DAN_SETTING);
        return process.env.DAN_SETTING? JSON.parse(process.env.DAN_SETTING) : {};
    }
}


