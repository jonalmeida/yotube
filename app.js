
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , request = require('request')
  , fs = require('fs');
var app = module.exports = express.createServer();

// API

// Read API_KEY from conf/settings.json file:
var API_KEY = ""
var STORAGE_FILE = "./config.json"

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/yo', function(req, res) {
    console.log("Received a yo. Responding back...");
    data = {"api_token":API_KEY, "username":req.query.username};
  request.post(
    {
        url:     "http://api.justyo.co/yoall/",
        form:    { "api_token" : API_KEY, "username":req.query.username }
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    });
});

var originalUrl;
var newUrl;

readUrlFromFile(STORAGE_FILE, originalUrl);

function send_yo(username) {
  request.post(
    {
        url:     "http://api.justyo.co/yoa/",
        form:    { "api_token" : API_KEY, "username": username}
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    });
}

function send_yo_all () {
  // body...
  request.post(
    {
        url:     "http://api.justyo.co/yoall/",
        form:    { "api_token" : API_KEY}
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    });
}

function readUrlFromFile(file, url) {
    fs.readFile(file, function(err, data) {
      if(err) throw err;
      url = (JSON.parse(data)).url;
      return (JSON.parse(data)).url;
    });
}


// read from file initially
//readJson();
//readFile();
//writeFile();
function readFile() {
    fs.readFile(STORAGE_FILE, function(err, data) {
        if(err) throw err;
        console.log(JSON.parse(data));
    });
}

function writeFile() {
    fs.writeFile(STORAGE_FILE,
        JSON.stringify({
            "stuff": "something"
        }, null, 4),
        function(err) {
            if (err) throw err;
            console.log("SAVED!!!!!!!!!!!!");
        }
    );
}

function readJson() {
    var url = "http://gdata.youtube.com/feeds/users/sxephil/uploads?max-results=1&alt=json";

    request({
        url: url,
        json: true
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body.feed.entry[0].id.$t);
            var tmp_url = body.feed.entry[0].id.$t;
            if (tmp_url != originalUrl) {
                // send yo
                // 
            };
        }
    });
}

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
