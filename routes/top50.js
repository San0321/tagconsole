var express = require('express');
var router = express.Router();
//var priv = require('../private/javascripts/gitkey.js');

/* GET top50 */
router.get('/', function(req, res, next) {
  res.render('top', { title: 'Top 50 Tags' });
});

router.get('/dates', function(req, res, next){
    var git = req.git;
    git.authenticate({
        type: "oauth",
        token: process.env.GIT_KEY
    });
    console.log(req.query);
    var topLastUpdated = {};
    git.repos.getCommits({ 
        owner: "dompham",
        repo: "utui",
        path: "stratocaster/templates/utag." + req.query.id + ".js"
    }, function (err,data) {
    topLastUpdated[req.query.id] = data.data[0].commit.author.date;
    res.json(topLastUpdated);
    });

})

module.exports = router;

