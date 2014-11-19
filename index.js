
// Heroku requires a server (error if fail to bind to port in time)
var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5000))
app.get('/', function(request, response) {
  response.send('Hello World!')
});
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});


console.log('HELLO!!!!');

// BOT!

// var Hodor = require('./hodorBot.js')('./config.json');
// Hodor.startStream();