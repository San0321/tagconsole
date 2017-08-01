var express = require('express');
var router = express.Router();
//var priv = require('../private/javascripts/gitkey.js');

router.get('/tags', function(req, res) {
    var git = req.git;
    git.authenticate({
        type: "oauth",
        token: process.env.GIT_KEY
    });

    git.repos.getContent({owner: "dompham", repo:"utui",path:"src/utui/dict/config/resource.json"}, function(err,data) {
    var b64string = data.data.content;
    var buf = new Buffer.from(b64string, 'base64').toString("utf8");
    res.json(buf);
    });
});

module.exports = router;