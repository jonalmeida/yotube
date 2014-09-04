/**
 * Module dependencies.
 */
var express = require('express'),
    routes = require('./routes'),
    request = require('request'),
    fs = require('fs');
var app = module.exports = express.createServer();

var API_KEY = ""
var STORAGE_FILE = "./config.json"

// Read API_KEY from conf/settings.json file:
if (API_KEY != "") {
    fs.readFileSync("./conf/settings.json", function(err, data) {
        if (err) throw err;
        console.log("Reading API_KEY from conf/settings.json")
        API_KEY = JSON.parse(data).api_key
    });
}

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

app.get('/', routes.index);

app.get('/yo', function(req, res) {
    console.log("Received a yo. Responding back...");
    data = {
        "api_token": API_KEY,
        "username": req.query.username
    };
    request.post({
            url: "https://api.justyo.co/yo/",
            form: {
                "api_token": API_KEY,
                "username": req.query.username
            }
        },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        });
    if (fs.existsSync("users.file")) {
        fs.appendFile("users.file", req.query.username, function(err) {
            if (err) throw err;
               console.log('Appending user to file failed! ' + req.query.username);
        })
    }
});

var originalUrl = "";
var newUrl;

function sendYo(username, link) {

    var response = {
            url: "https://api.justyo.co/yo/",
            form: {
                "api_token": API_KEY,
                "username": username
            }
        };

    if (link != undefined)
        response.form["link"] = link;

    request.post(response,
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            } else {
                console.log("ERROR:");
                console.log(error);
                console.log("RESPONSE:");
                console.log(response);
                console.log("BODY:");
                console.log(body);
            }
        });
}

function sendYoAll() {
    // body...
    request.post({
            url: "https://api.justyo.co/yoall/",
            form: {
                "api_token": API_KEY
            }
        },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        });
}

function readUrlFromFile(file) {
    var config_data = fs.readFileSync(file);
    return JSON.parse(config_data).url;
}


// read from file initially
//readJson();
//readFile();
//writeFile();
function readFile() {
    fs.readFile(STORAGE_FILE, function(err, data) {
        if (err) throw err;
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

function writeNewUrl(url) {
    fs.writeFileSync(STORAGE_FILE,
        JSON.stringify({
            "url": url
        }, null, 4)
    );
}

function readJson() {
    console.log("Calling readJson()");
    if (process.argv[2]) {
        var url = "http://gdata.youtube.com/feeds/users/" + process.argv[2] + "/uploads?max-results=1&alt=json";
        console.log("Using different youtube user: " + process.argv[2]);
    } else {
        var url = "http://gdata.youtube.com/feeds/users/sxephil/uploads?max-results=1&alt=json";
        console.log("Using phil by default..");
    }
    

    request({
        url: url,
        json: true
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body.feed.entry[0].link[0].href);
            var tmp_url = body.feed.entry[0].link[0].href;
            if (tmp_url != originalUrl) {
                // send yo
                // 
                sendYo("JONATHANNNN");
                writeNewUrl(tmp_url);
                originalUrl = tmp_url;
                console.log("Current url: " + originalUrl);
            };
        }
    });
}


if (fs.existsSync(STORAGE_FILE)) {
    //read
    console.log("File exists");
    originalUrl = readUrlFromFile(STORAGE_FILE);
    console.log("Current url: " + originalUrl);
} else {
    console.log("File does not exist, creating file.");
    fs.openSync(STORAGE_FILE, 'w');
    console.log("Writing empty url string.");
    writeNewUrl("");
    console.log("Current url: " + "\"\"");
}

setInterval(readJson, 60 * 10 * 1000);


app.listen(3000, function() {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});