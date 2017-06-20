var express = require('express');
var router = express.Router();

/* GET background page. */
router.get('/background', function(req, res, next) {
  res.render('background', { title: 'Background' });
});

module.exports = router;