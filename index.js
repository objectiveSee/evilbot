

// Heroku requires a server (error if fail to bind to port in time)
var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5000))
// app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})


// Configure Bot
var b = require('./EvilBot.js')('./config.json');
b.startStream();