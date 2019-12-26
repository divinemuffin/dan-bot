const express = require("express");
const bodyParser = require('body-parser');
const app = express();

require('./scripts/commands');

import {
    c_help,
    c_echo,
    c_start,
    c_hello
} from "./scripts/commands";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post("/api/server", function(req: any, res: any) {
  console.log("req.path", req.path);

  if (req.body) {
    const { message } = req.body;
    tryToExecuteCommand(message);
  }
  res.send('Hello from /api/server!');
});

app.listen(process.env.PORT || 5000, () => console.log(`Telegram bot is listening on port ${process.env.PORT || 5000}!`));

function tryToExecuteCommand(msg: any): void {
    console.log('Received Text: ', msg.text)
    switch(msg.text) {
      case '/hello':
        c_hello(msg);
        break;
      case '/start':
        c_start(msg);
        break;
      case '/echo':
        let telegram_url = "https://api.telegram.org/bot" + process.env.BOT_TOKEN +"/sendMessage";

        console.log("Sending message to bot nativelly!", telegram_url);

        app.post(telegram_url, {
          chat_id: msg.chat.id,
          text: `You said: ${msg.text}`
        }).then((response: any) => {
            console.log("Message posted");
            response.status(200).end("ok");
        }).catch((error: any) =>{
            console.error("UPERSERIOUS ERROR OCCURED", error);
        });
        console.log("executing c_echo ....");
        c_echo(msg);



        break;
      default:
        console.log('Unable to recognise command!');
    }
}
