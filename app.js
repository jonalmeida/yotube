/**
 * Module dependencies.
 */
var express = require('express'),
    request = require('request'),
    winston = require('winston'),
    fs = require('fs');
var app = module.exports = express.createServer();

var API_KEY = ""
var STORAGE_FILE = "./settings.json"
var originalUrl = "";
var YOUTUBE_CHANNEL = "";
var youtube_url = "";

// Logging
winston.add(winston.transports.File, {
    filename: 'debug.log'
});
// Uncomment to stop logging to console
//winston.remove(winston.transports.Console);

// Read API_KEY from conf/settings.json file or env
if (process.env.API_KEY) {
    API_KEY = process.env.API_KEY;
    winston.info("Using env API_KEY..");
}
if (process.env.YOUTUBE_CHANNEL) {
    YOUTUBE_CHANNEL = process.env.YOUTUBE_CHANNEL;
    youtube_url = "https://gdata.youtube.com/feeds/api/users/" + process.env.YOUTUBE_CHANNEL + "/uploads?v=1&max-results=2&orderby=published&alt=json";
    winston.info("Using env YOUTUBE_CHANNEL user: " + process.env.YOUTUBE_CHANNEL);
}

if (API_KEY == "" || YOUTUBE_CHANNEL == "") {
    var config_json = JSON.parse(fs.readFileSync("./conf/config.json"));
    if (API_KEY == "")
        API_KEY = config_json.api_key;
    if (YOUTUBE_CHANNEL == "") {
        YOUTUBE_CHANNEL = config_json.youtube_channel;
        youtube_url = "https://gdata.youtube.com/feeds/api/users/" + config_json.youtube_channel + "/uploads?v=1&max-results=2&orderby=published&alt=json";
    }
    winston.info("Using config file because of missing env variables.");
}

winston.info("Youtube URL: " + youtube_url);
winston.info("API key: " + API_KEY.slice(0, 4) + "..[hidden]");

// Configuration

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    res.send({
        response: "SERVER_OKAY"
    });
});

app.get('/yo', function(req, res) {
    winston.info("Received a yo. Responding back...");
    // response_payload = {
    //     "api_token": API_KEY,
    //     "username": req.query.username
    // };
    // request.post({
    //         url: "https://api.justyo.co/yo/",
    //         form: response_payload
    //     },
    //     function(error, response, body) {
    //         if (!error && response.statusCode == 200) {
    //             winston.info(body);
    //         }
    //     });
    if (fs.existsSync("users.file")) {
        winston.info("User registered:" + req.query.username);
        fs.appendFile("users.file", req.query.username + "\n", function(err) {
            if (err)
                winston.error('Appending user to file failed! ' + req.query.username);
        })
    }
});

function sendYo(username, link) {

    var yoResponse = {
        url: "https://api.justyo.co/yo/",
        form: {
            "api_token": API_KEY,
            "username": username
        }
    };

    if (link != undefined)
        yoResponse.form["link"] = link;

    request.post(yoResponse,
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                winston.error(body);
            } else {
                winston.info("ERROR:");
                winston.info(error);
                winston.info("RESPONSE:");
                winston.info(response);
                winston.info("BODY:");
                winston.info(body);
            }
        });
}

function sendYoAll(link) {
    winston.info("Sending Yo All...");
    var yoResponse = {
        url: "https://api.justyo.co/yoall/",
        form: {
            "api_token": API_KEY
        }
    };

    if (link != undefined)
        yoResponse.form["link"] = link;


    request.post(yoResponse,
        function(error, response, body) {
            if (error) {
                winston.error(body);
            }
        });
}

function readUrlFromFile(file) {
    var config_data = fs.readFileSync(file);
    return JSON.parse(config_data).url;
}

function readFile() {
    fs.readFile(STORAGE_FILE, function(err, data) {
        if (err) throw err;
        winston.info(JSON.parse(data));
    });
}

function writeFile() {
    fs.writeFile(STORAGE_FILE,
        JSON.stringify({
            "stuff": "something"
        }, null, 4),
        function(err) {
            if (err) throw err;
            winston.info("SAVED!!!!!!!!!!!!");
        }
    );
}

function writeNewUrl(url) {
    fs.writeFileSync(STORAGE_FILE,
        JSON.stringify({
            "url": url
        }, null, 4)
    );
}

function readJson() {
    winston.info("Calling readJson()");
    request({
        url: youtube_url,
        json: true
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            winston.info(body.feed.entry[0].link[0].href);
            var tmp_url = body.feed.entry[0].link[0].href;
            if (tmp_url != originalUrl) {
                sendYoAll(tmp_url);
                writeNewUrl(tmp_url);
                originalUrl = tmp_url;
                winston.info("New channel url: " + originalUrl);
            };
        }
    });
}


if (fs.existsSync(STORAGE_FILE)) {
    //read
    winston.info("File exists");
    originalUrl = readUrlFromFile(STORAGE_FILE);
    winston.info("Current url grabbed from file: " + originalUrl);
} else {
    winston.info("File does not exist, creating file.");
    fs.openSync(STORAGE_FILE, 'w');
    winston.info("Writing empty url string.");
    writeNewUrl("");
    winston.info("Current url: " + "\"\"");
}
//Initial check on startup
readJson()

setInterval(readJson, 60 * 5 * 1000);


app.listen(process.env.PORT || 3000, function() {
    winston.info("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});