var express = require('express');
var router = express.Router();


router.get('/tags', function(req, res) {
    var db = req.db;
    db.collection("masterTag").find().toArray(function(err, result) {
    if (err) {
        console.log(err);
    }
    else {
        res.json(result);
    }
});

});

module.exports = router;var express = require('express');
var router = express.Router();


router.get('/tags', function(req, res) {
    var db = req.db;
    db.collection("masterTag").find().toArray(function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });

});

module.exports = router;