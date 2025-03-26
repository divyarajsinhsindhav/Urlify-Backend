require('dotenv').config();
const jwt = require('jsonwebtoken')

exports.authantication = async (req, res, next) => {
    try {
        const header = req.headers['authorization'];
        if (!header) return res.send({ message: 'You are not authanticated' })
        const token = header.split(' ')[1]
        const { userId, role } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.userId = userId;
        req.role = role;
        next();
    } catch (e) {
        return res.send({ message: 'Internal Server Error during authantication.' })
    }
}