var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var response1 = mongoose.model('response1')

/* POST to mongodb.*/
router.get('/insert', function(req, res, next) {
  res.render('insert', { title: 'Insert' });
});

module.exports = router;
