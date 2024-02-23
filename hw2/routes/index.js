var express = require('express');
var router = express.Router();

const { words } = require('../words.js');

router.get('/', (req, res) => {
    res.send(words); // Sending words as response
});

module.exports = router;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
