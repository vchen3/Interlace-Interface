var express = require('express');
var router = express.Router();

/* GET responseList page. */
router.get('/responselist', function(req, res) {
    var db = req.db;
    var collection = db.get('db.responses1');

    console.log("COLLECTION");
    console.log(collection)

    res.render('responselist', { title: 'Responses', list: 'hey,hi,hello' });
    /*collection.find({},{},function(e,docs){
        res.render('responselist', {
            "responselist" : docs
        });
    });*/
});

module.exports = router;