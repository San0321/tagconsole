var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var GitHubApi = require("github");
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_URI;
var cron = require('node-cron');
var ObjectId = require('mongodb').ObjectId; 



// Init Database
var database;

MongoClient.connect(url, function(err, db){
    if(err) {
        console.log(err);
    } else {
        database = db;
    }
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
    timeout: 30000 // Timeout is 30 Seconds
});

var latestResourceJSON;
var tagData = {};
var indexTracker = 0;
var idArray = [];

var numberOfRequests = 55;
var indexEndTracker = numberOfRequests;
var timeString = "";


// Check the Time Zone for setting to Midnight
//cron.schedule('* 7 * * *', function(){
// cron scheduler
    github.authenticate({
        type: "oauth",
        token: process.env.GIT_TOKEN
    });

    github.repos.getContent({owner: "dompham", repo:"utui",path:"src/utui/dict/config/resource.json"}, function(err,data) {
        if (err) {
            console.log((err.code));
        } else {
            var b64string = data.data.content;
            latestResourceJSON = new Buffer.from(b64string, 'base64').toString("utf8");

            // replace symbols
            latestResourceJSON = latestResourceJSON.replace(/\\n/g, "\\n")
              .replace(/\\'/g, "\\'")
              .replace(/\\"/g, '\\"')
              .replace(/\\&/g, "\\&")
              .replace(/\\r/g, "\\r")
              .replace(/\\t/g, "\\t")
              .replace(/\\b/g, "\\b")
              .replace(/\\f/g, "\\f");

            // remove non-printable and other non-valid JSON chars
            latestResourceJSON = latestResourceJSON.replace(/[\u0000-\u0019]+/g, "");
            latestResourceJSON = JSON.parse(latestResourceJSON).manageList;

            // push objects containing id and title to idArray
            for (var id in latestResourceJSON) {
                console.log(id);
                idArray.push({ "id" : id,
                               "title": latestResourceJSON[id].title });
            }
            console.log("this is ID " +idArray[0].id);
            console.log("This is Title " + idArray[0].title);
            // console.log(idArray);

            // get when to request
            var requestTimes = Math.ceil((idArray.length)/numberOfRequests);


            for(var i = 49; i <= (49+requestTimes); i++ ) {
                if (i >= 60){
                    i = (i - 60);
                    timeString += i + ",";
                    i += 60;
                }
                else {
                    timeString += i + ",";
                }

            }
            timeString = timeString.substring(0, (timeString.length -1));

            timeString += " * * * *";
            console.log(timeString);
            startScheduler(timeString , idArray);

        }
    });

//});

           
/*
     * JSON file structure:                  
     {
        id: {
            title:
            date: (last updated)
            html_url: (git url)
        }                            
     }
     */

function startScheduler (timeString, idArray) {
    cron.schedule(timeString, function(){

        // IndexEndTracker is a leading tracker and indexTracker is a trailing tracker
        for (var i = indexTracker; i < indexEndTracker; i++ ) {
            (function(x) {
                // Add Title and ID
                github.repos.getCommits({ 
                    owner: "dompham",
                    repo: "utui",
                    path: "stratocaster/templates/utag." + idArray[x].id + ".js"
                }, function (err,data) {
                    tagData[idArray[x].id] = {};
                    tagData[idArray[x].id].title = idArray[x].title;
                    if (err) {
                        // if there is a no correpsonding file name just add it to tagData with ID and Name
                        tagData[idArray[x].id].html_url = "N/A";
                        tagData[idArray[x].id].date = "N/A";
                        console.log("------------------------------------------------------");
                        console.log(Object.keys(tagData).length + " This is Object's Length");
                        console.log("------------------------------------------------------");
                        console.log(x);
                    } else {
                        console.log("ID and Title are " +idArray[x]);
                        console.log("ID is " + idArray[x].id);
                        console.log("This is an IndexTracker " + indexTracker);
                        console.log("This is an IndexEndTracker " + indexEndTracker);
                        console.log("------------------------------------------------------");
                        console.log(Object.keys(tagData).length + " This is Object's Length");
                        console.log("------------------------------------------------------");
                        console.log(idArray.length + " This is ID Array Length");
                       
                        if(data.data[0]) {
                            /*
                             * To seek other Data that are retrieved, console.log(JSON.stringify(data.data[0])) 
                             */
                         tagData[idArray[x].id].html_url = data.data[0].html_url;
                         tagData[idArray[x].id].date = ((data.data[0].commit.author.date).toString()).substring(0,10);
                        }
                        else {
                            // If there is no Date or URL just leave Not applicable
                            tagData[idArray[x].id].html_url = "N/A";
                            tagData[idArray[x].id].date = "N/A";
                        }

                        // Send the Data to Mongo, Right Now it will send multiple times.
                        if ((Object.keys(tagData).length) === idArray.length)  {
                            var date = new Date();
                            tagData.thisDate = date.toDateString();
                            updateMasterTag(tagData);
                        }
                    }
                });
            })(i)
        }
        // Move both trackers numberOfRequests
        if(indexEndTracker < ((idArray.length))) {
            indexTracker+= numberOfRequests;
            indexEndTracker = (indexTracker + numberOfRequests);    
        }
        if(indexEndTracker > ((idArray.length))) {
            indexEndTracker = idArray.length;
        }
    });
}

// 'masterTag' collection should be inside of Database to successfully update the document 
 function updateMasterTag(tagData) {

    console.log(JSON.stringify(tagData));
    database.collection('masterTag').replaceOne({"_id": ObjectId("5994aab7734d1d3c0a2fea81")}, tagData, function (err, results){
            if(err) { console.log(err); } else {
                console.log("Tag Data is Newly Updated. ");
            }
    });
}

//Init routes
const index = require('./routes/index');
const list = require('./routes/taglist');
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


// Expose mongo and github to idhold
app.use('/',function(req,res,next) {
    req.db = database;
    req.git = github;
    next();
});

//Express Routes
app.use('/', index);
app.use('/taglist', list);
app.use('/idhold', idhold);

module.exports = app;

