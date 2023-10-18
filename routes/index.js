var express = require('express');
var router = express.Router();
const Comment = require('../models/comment');
const upload = require('../utils/cloudinary');

const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const tagController = require('../controllers/tagController');

// Posts routes

router.get('/posts', postController.post_list_get);
router.get('/posts/:postid', postController.post_get);
router.delete('/posts/:postid', postController.delete_post);

// new post

router.post('/posts/new', postController.add_post_post);
router.post('/posts/new/image', upload.upload.single('image'), (req, res) => {
    res.json({url: req.file.path })
})

// post comments
router.get('/posts/:postid/comments', paginatedComments(Comment), (req, res) => {
    res.json(res.paginatedComments);
})

router.post('/posts/:postid/comment', postController.post_add_comment);

router.post('/signup', userController.user_create_post);

router.get('/posts/fromtag/:tag', postController.postTag_get);

// spotlight

router.get('/spotlight', postController.spotlight_get);

// Category/Tag routes

router.get('/tagslider', tagController.tag_slider_list);

router.get('/tags/all', tagController.tag_list_get);

// login routes
router.get('/login', userController.user_login_get);
router.post('/login', userController.user_login);

// check for token

router.get('/token', userController.verify_token_get);

// user profile routes

router.get('/user/:username', userController.user_profile_get);
router.put('/user/:username', userController.user_change_image);

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
            results.results = await model.find({ post: req.params.postid }).sort({ date: -1 }).populate('user', 'name').skip(startIndex).limit(limit).exec()
            res.paginatedComments = results;
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

module.exports = router;
