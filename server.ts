const express = require("express");
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post("/api/server", function(req: any, res: any) {
  console.log("req.path", req.path);

  if (req.body) {
    console.warn("BODY FOUND: ", req.body);
    const { message } = req.body;
    const chatId = message.chat.id;
    let reply = "Welcome to telegram DAN bot";

    bot.sendMessage(chatId, reply);
  }

  console.log('\n\n');

  console.dir(req);

  console.log('\n\n');

  
  res.send('Hello from /api/server!');
});

app.listen(process.env.PORT || 5000, () => console.log(`Telegram bot is listening on port ${process.env.PORT || 5000}!`));
