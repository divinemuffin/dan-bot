// ENTRY POINT (start program from here)

import {DanConsole} from './__utils';

const {bot} = require('../bot');
const dansole = new DanConsole(true);

const minimist = require('minimist');

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
require('./commands.ts');
