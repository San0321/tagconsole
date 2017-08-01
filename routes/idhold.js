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
        res.send(result);
	})
});

module.exports = router;
