var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the api'
    })
});

module.exports = router;
