// ENTRY POINT (start program from here)

if (process.env.NODE_ENV !== 'production') {
  // checking if running in production environment.
  // NODE_ENV will be set by node automatically if so

  // loading dotenv vars to process.env
  require('dotenv').config();
}

process.env.NTBA_FIX_319 = '1';

import { DanConsole } from "./scripts/__utils";
import { Http2ServerResponse, Http2ServerRequest } from "http2";
import { ITelegramMessage } from "./models/telegram";
const {bot} = require('./scripts/bot');
const dansole = new DanConsole(true);
const http = require('http');

var express = require("express");
var app = express();

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

dansole.info('Core initiated. Loading dependencies ...');

const server = http.createServer(function (request: Http2ServerRequest, response: Http2ServerResponse) {
  console.log(`Connected to server ${request.headers.host}`);
  // const message: ITelegramMessage = request.body.message;
  // const chatId = (message) ? message.chat.id : 1000000;
  // bot.sendMessage(chatId, `Connected to server ${request.url}`);

}).listen(process.env.PORT || 5000);

app.post("/start_bot", function(req: any, res: Http2ServerResponse) {
  const { message } = req.body;
  const chatId = message.chat.id;
  let reply = "Welcome to telegram weather bot";


  bot.sendMessage(message.chat.id, reply);
});

app.listen(process.env.PORT || 5000, () => console.log(`Telegram bot is listening on port ${process.env.PORT || 5000}!`));

module.exports = {
  setCommand: newCommand,
  server
};

// initiating commands
require('./scripts/commands');
