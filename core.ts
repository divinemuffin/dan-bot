// ENTRY POINT (start program from here)

if (process.env.NODE_ENV !== 'production') {
  // checking if running in production environment.
  // NODE_ENV will be set by node automatically if so

  // loading dotenv vars to process.env
  require('dotenv').config();
}

process.env.NTBA_FIX_319 = '1';

import { DanConsole } from "./scripts/__utils";
const {bot} = require('./scripts/bot');
const dansole = new DanConsole(true);

/**
 * Suppose you have Array of objects and you need Array with their values. This function does that
 *
 * @param {string} name - how command can be called
 * @param {Function} callback - function of command
 * @param {boolean} isArguments - if true command can be followed by argument
 * @example
 *      newCommand('do_thing --fast', onEvent, true)
 */
function newCommand(name: string, callback: Function, isArguments: boolean = false): void {
  const regExp = (!isArguments) ? new RegExp(`\/${name}`) : new RegExp(`\/${name} (.+)`);

  bot.onText(regExp, callback);
}

module.exports = {
  setCommand: newCommand
};

dansole.info('Core initiated. Loading dependencies ...');

// initiating commands
require('./scripts/commands');
