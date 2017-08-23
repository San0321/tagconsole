// Use your MONGO_URI to replace with the newest rank Data in Mongo

var parseXlsx = require('excel');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = process.env.MONGO_URI;

// Needs Excel File name
var file = (process.argv.slice(2))[0];


var tagsInRank = {}
var numberOfTags = 0;

// Parsing from the second tab
parseXlsx(file, '2', function(err, data) {
	if(err) throw err;

	// gets for the total number of tags
	for (var j=0; j < data.length; j++) {
		if(data[j][1] === "TOTAL") {
			numberOfTags = parseInt(data[j][0]);
		} 
	}

	// error handling when there is no number of total tags
	if (!numberOfTags) {
		console.log("There should be a number of total tags left to the 'TOTAL'");
		process.exit(0);
	}

	// Assuming Tag ID is on first column (starting from second row)
	for(var i = 1; i <= numberOfTags; i++) {
		tagsInRank[((data[i][0]).substring(0,(data[i][0]).length - 2))] = i;
	}

	// Getting Time Stamp
	var date = new Date();
	tagsInRank.date = date.toDateString();

	// Debugging Purpose
	// fs.writeFile('temp.json', JSON.stringify(tagsInRank), function (err) {});


	// Connect Mongo and replace it a masterTag document in masterTag
	MongoClient.connect(url, function(err, db){
	    if(err) {
	        console.log(err);
	    } else {
	        db.collection('masterTag').replaceOne({"_id": ObjectId("599b4db3734d1d0dd4069866")}, tagsInRank, function (err, results){
	            if(err) { console.log(err); } else {
	                console.log("Tag Rank is Newly Updated.");
	                process.exit(0);
	        	}
	    	});
   	 	}
	});

});

