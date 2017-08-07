var express = require('express');
var router = express.Router();


/* GET ID Hold page. */
router.get('/', function(req, res, next) {
  res.render('idhold');
});


router.get('/read', function(req, res) {
    var db = req.db;

    db.collection("reserved").find().toArray(function(err, result) {
        if (err) throw err;
     //   initData = result;
        res.send(result);
       // res.json(result);
	})
});

router.post('/insert',function(req, res) {

	var tagId = req.body.id;
	var tagName = req.body.name;
	var insertToken = true;

	var db = req.db;
	// 
    db.collection('reserved').find().sort({'id': 1 }).toArray(function(err, current) {
        if (err) throw err;

        for (var i = 0; i < current.length; i++) {
			if (current[i].id === tagId) {
				tagId = parseInt(tagId, 10);
				tagId++;
				tagId = tagId.toString();
			}
		}

		db.collection('reserved').insertOne({"id": tagId, "name": tagName }, function(err, result){
			if (err) throw err;

			res.send({"id": tagId, "name": tagName });	
		});
    })
});


router.post('/delete', function(req, res){

	var db = req.db;
	var itemsToBeDeleted = req.body.items;

	// for button click deletion
	if (req.body.id) {
		db.collection('reserved').deleteOne({"id": req.body.id.toString()}, function(err, result){
	 		if (err) throw err;	
		})
	} 

	// for automatic deletion
	if (itemsToBeDeleted) {
		itemsToBeDeleted = JSON.parse(itemsToBeDeleted);
		for (var i = 0; i < itemsToBeDeleted.length; i++ ) {
			db.collection('reserved').deleteOne({"id": itemsToBeDeleted[i].toString()}, function(err, result){
	 			if (err) throw err;	
			})
		}
	} 

	res.sendStatus(200);
	
});



module.exports = router;
