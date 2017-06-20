
/* GET responseList page. */
router.get('/responselist', function(req, res) {
    var db = req.db;
    var collection = db.get('db.responses1');
    collection.find({},{},function(e,docs){
        res.render('responselist', {
            "responselist" : docs
        });
    });
});