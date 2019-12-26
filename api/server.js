var express = require("express");
var app = express();

// const server = http.createServer(function (request, response) {
//     console.log(`Connected to server ${request.headers.host}`);
//     // const message: ITelegramMessage = request.body.message;
//     // const chatId = (message) ? message.chat.id : 1000000;
//     // bot.sendMessage(chatId, `Connected to server ${request.url}`);
  
//   }).listen(process.env.PORT || 5000);

app.get('/', function (req, res) {
  console.log('request for GET /');

  res.send('GET Hello World!');
  console.log(req.path, req.method, ' finisnhed');
});

app.post('/', function(req, res) {
  console.log('request for POST /');
  res.send('post hello world');
  console.log(req.path, req.method, ' finisnhed');
});




app.get('/api/server', function (req, res) {
  console.log('request for GET /api/server');

  res.send('GET Hello World form api/server!');
  console.log(req.path, req.method, ' finisnhed');
});

app.post('/api/server', function(req, res) {
  console.log('request for POST /api/server');
  const {message} = req.body;
  const chatId = message.chat.id;
  let reply = "Welcome to telegram DAN bot";

  bot.sendMessage(chatId, reply);
  res.send('post hello world from api/server');
  console.log(req.path, req.method, ' finisnhed');
});



app.get('/api/server/info', function (req, res) {
  console.log('request for GET /api/server/info');

  res.send('GET Hello World form api/server!');
  console.log(req.path, req.method, ' finisnhed');
});

app.post('/api/server/info', function(req, res) {
  console.log('request for POST /api/server/info');

  
  console.log(">> DAN Bot sent: /api/server/info");
  console.log("BODY: ", req.body);


  const {message} = req.body;
  const chatId = message.chat.id;

  console.log(message);
  console.log(chatId);


  bot.sendMessage(chatId, "Welcome to telegram DAN bot");
  res.send('post hello world from api/server');

  console.log(req.path, req.method, ' finisnhed');
});




app.get("/info", function(req, res) {
  console.log('request for GET /info');
  console.log("INFO", req.body);
  res.send(req, ' finisnhed');
});

app.post("/info", function(req, res) {
  const {message} = req.body;
  console.log("INFO", req.body);
  const chatId = message.chat.id;
  let reply = "Welcome to telegram weather bot";

  bot.sendMessage(message.chat.id, reply);
  res.send(req, ' finisnhed');
});

console.log(`Just before listening on port ${process.env.PORT}... `);
app.listen(`api/server`);
  