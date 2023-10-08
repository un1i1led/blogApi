const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token == 'null') {
        return res.json({ msg: 'no token' });
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

module.exports = { requireAuth, requireNotAuth };