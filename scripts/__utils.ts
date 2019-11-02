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
}


