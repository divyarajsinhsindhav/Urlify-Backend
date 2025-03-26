const express = require('express')
const router = express.Router()
const {clickOnUrl} = require('../controllers/url.controllers')

router.get('/', (req, res) => {
    res.send("We Will Coming Soon!🔗")
})

router.get('/:shortId', clickOnUrl);

module.exports = router