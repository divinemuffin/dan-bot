// [ BOT CONFIG ]

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// @ToDo Separate this bitch into two modules

// [ DB CONFIG ]

const DATABASE_URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_SHARDS}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const mongoose = require('mongoose');
// connecting DB to env variable
mongoose.connect(DATABASE_URL, {useUnifiedTopology: true, useNewUrlParser: true}).catch((error: Error) => {
  console.error(`[DAN] >> Error: failed to connect to Mongo DB! \n`, error);
});

// accessing connection to DB
const db = mongoose.connection;

db.on('error', (error: Error) => console.error(`[DAN] >> Error: Mongo DB failed \n`, error));
db.once('open', () => console.info('Connected to Mongoose DB!'));

module.exports = {bot, db};


