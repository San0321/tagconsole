// Use your MONGO_URI to replace with the newest rank Data in Mongo

var parseXlsx = require('excel');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = process.env.MONGO_URI;

var tagsInRank = {}

// Parse Excel File 
parseXlsx('tempfile.xlsx', '2', function(err, data) {
	if(err) throw err;
	for(var i = 1; i <= 962; i++) {
		// Assuming Tag ID is on first column (starting from second row)
		tagsInRank[((data[i][0]).substring(0,(data[i][0]).length - 2))] = i;
	}

	// Getting Time Stamp
	var date = new Date();
	tagsInRank.date = date.toDateString();

	// Debugging Purpose
	//	fs.writeFile('temp.json', JSON.stringify(tagsInRank), function (err) {});


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

