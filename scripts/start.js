const {bot, db} = require('../bot');

console.log(`[DAN] >> DataBase available ${db}`);

function setCommand(name, callback, isArgument = false) {
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
      keyboard: [[{text: 'Hop in!', callback_data: '\/step1'}]],
    },
  });
});
