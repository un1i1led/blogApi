var express = require('express');
var router = express.Router();

const postController = require('../controllers/postController');
const userController = require('../controllers/userController');

router.post('/posts', postController.post_add_post);
router.get('/posts', postController.post_list_get);
router.get('/posts/:postid', postController.post_get);

router.post('/users', userController.user_create_post);

/* GET home page. */
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the api'
    })
});

module.exports = router;
