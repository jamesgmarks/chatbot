var express = require('express');
var bodyParser = require('body-parser');
var WebSocket = require('ws');
// About express-validator: 
//     https://booker.codes/input-validation-in-express-with-express-validator/
var validator = require('express-validator');

var config = {
    httpPort: 3099,
    wssPort: 8080
}

var app = express();

var wss = new WebSocket.Server({
  perMessageDeflate: false,
  port: config.wssPort
});

wss.on('connection', function connection(ws) {
    
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});

var guid = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

app.use(bodyParser.json());
app.use(validator());
app.use(express.static('public'));

var liveUsers = [];
var addLiveUser = function(username, email) {
    if(liveUsers.findIndex(u => u.username === username) !== -1) {
        return false;
    }
    var newUser = {
        username, email, token: guid()
    };
    console.log(liveUsers.push(newUser) + " users.");
    console.log(newUser);
    return newUser;
}

var loginRouter = express.Router();
loginRouter.route('')
    .get(function(req, res) {
        res.send("get request");
    })
    .post(function(req, res) {
        if(!req.body.username || !req.body.email) {
            res.statusCode = 401;
            res.statusMessage = "Not Authorized";
            res.json({ error: "error", message: "Not Authorized" });
        }
        req.checkBody("email", "Enter a valid email address.").isEmail()
        var errors = req.validationErrors();
        if(errors) {
            res.statusCode = 403;
            res.statusMessage = "Invalid Email Address";
            res.json({ error: "error", message: "Invalid email address.", errors });
            return;
        }
        res.status(200);
        var responseJSON = addLiveUser(req.body.username, req.body.email);
        if(!responseJSON) {
            res.status(500);
            res.statusMessage = "Error adding user. Username may already be in use.";
            res.json({error:"error", message: "Error adding user. Username may already be in use." });
        } else {
            res.json(responseJSON);
        }
    });

// This is KEY to making a router work. Must "use" by express app.
app.use('/login', loginRouter);

// TODO: configurable port #
app.listen(config.port);
console.log("App listening at " + config.port + ".");