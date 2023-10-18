const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token == 'null') {
        return res.json({ msg: 'no token' });
    } else {
        jwt.verify(token, 'secretkey', (err, decoded) => {
            if (err) {
                return res.json({ msg: err, username:'' });
            } else {
                res.locals.username = jwt.decode(token).user.username;
                next();
            }
        })
    }
}

const requireNotAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token == 'null') {
        next();
    } else {
        jwt.verify(token, 'secretkey', (err, decoded) => {
            if (err) {
                return res.json({ msg: 'token invalid' });
            } else {
                return res.json({ msg: 'has token' });
            }
        })
    }
}

const checkAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token == 'null') {
        res.locals.isAuth = false;
        res.locals.username = '';
    } else {
        jwt.verify(token, 'secretkey', (err, decoded) => {
            if (err) {
                res.locals.isAuth = false;
                res.locals.username = '';
            } else {
                res.locals.isAuth = true;
                res.locals.username = jwt.decode(token).user.username;
            }
        })
    }

    next();
}

module.exports = { requireAuth, requireNotAuth, checkAuth };