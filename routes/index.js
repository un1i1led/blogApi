var express = require('express');
var router = express.Router();
const Comment = require('../models/comment');

const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const tagController = require('../controllers/tagController');

router.get('/posts', postController.post_list_get);
router.get('/posts/:postid', postController.post_get);

// post comments
router.get('/posts/:postid/comments', paginatedComments(Comment), (req, res) => {
    res.json(res.paginatedComments);
})

router.post('/signup', userController.user_create_post);

router.get('/posts/fromtag/:tag', postController.postTag_get);

router.get('/tagslider', tagController.tag_slider_list);

// login routes

router.post('/login', userController.user_login);


/* GET home page. */
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the api'
    })
});

function paginatedComments(model) {
    return async(req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {}

        if (endIndex < model.length) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }

        try {
            results.results = await model.find({ post: req.params.postid }).populate('user', 'name').limit(limit).skip(startIndex).exec()
            res.paginatedComments = results;
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

module.exports = router;
