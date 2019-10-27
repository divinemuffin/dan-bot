import {IDanPost} from "../models/danbooru";
import {DanConsole} from "./utils";

const {bot, db} = require('../bot');
const {getPostsInfo} = require('./booru');
const dansole = new DanConsole;
const CHANNEL_ID = process.env.CHANNEL_ID;

const fs = require('fs');

console.log(`[DAN] >> DataBase available ${db}`);

function setCommand(name: string, callback: Function, isArgument: boolean = false) {
  /*
    * name - how command can be called
    * callback - function of command
    * isArgument - if true command can be followed by argument
    */
  const regExp = (!isArgument) ? new RegExp(`\/${name}`) : new RegExp(`\/${name} (.+)`);
  bot.onText(regExp, callback);
}

setCommand('start', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Thank you for visiting our hub!', {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [[{text: 'Hop in!', callback_data: '\/hello'}]],
    },
  });
});


setCommand('hello', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello there!').catch(e => dansole.error(e));
});

setCommand('info', (msg) => {
  const chatId = msg.chat.id;
  bot.getUpdates().then(res => {
    bot.sendMessage(chatId, JSON.stringify({
      botChatId: chatId,
      res
    })).catch(e => dansole.error(e));
  });
});


setCommand('link', async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Getting you a link ...').catch(e => dansole.error(e));
  const posts: Array<IDanPost> = await getPostsInfo();
  const rando = posts[Math.floor(Math.random()*posts.length)];
  await bot.sendMessage(chatId, rando.file_url).catch(e => dansole.error(e));
});


setCommand('pic', async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Getting you a picture ...').catch(e => dansole.error(e));
  const posts: Array<IDanPost> = await getPostsInfo();
  const rando = posts[Math.floor(Math.random()*posts.length)];
  await bot.sendPhoto(msg.chat.id, rando.file_url).catch(e => dansole.error(e))
});

setCommand('post', async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Getting you a picture with captions ...').catch(e => dansole.error(e));
  const posts: Array<IDanPost> = await getPostsInfo();
  const rando = posts[Math.floor(Math.random()*posts.length)];
  await bot.sendPhoto(CHANNEL_ID, rando.file_url, { caption: `${rando.md5}.${rando.file_ext}` }).catch(e => dansole.error(e))
});
