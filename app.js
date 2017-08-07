var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var GitHubApi = require("github");
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_URI;


// Init Database
var database;

MongoClient.connect(url, function(err, db){
if(err) throw err;
    database = db;
  //  db.close();
});


//Init github
var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    pathPrefix: "", // for some GHEs; none for GitHub
    headers: {
        "user-agent": "Do's Macbook" // GitHub is happy with a unique user agent
    },
    Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 10000
});

//Init routes
const index = require('./routes/index');
const list = require('./routes/taglist');
const top50 = require('./routes/top50');
const idhold = require('./routes/idhold');

//Init app
const app = express();

//View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Expose mongo to idhold
app.use('/idhold',function(req,res,next) {
    req.db = database;
    next();
});

//Expose github file
app.use('/', function(req,res,next){
    req.git = github;
    next();
});

//Express Routes
app.use('/', index);
app.use('/top50', top50);
app.use('/taglist', list);
app.use('/idhold', idhold);

module.exports = app;

