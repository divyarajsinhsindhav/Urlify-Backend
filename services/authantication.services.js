require('dotenv').config()
const jwt = require('jsonwebtoken')

exports.createAccessToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET)
}