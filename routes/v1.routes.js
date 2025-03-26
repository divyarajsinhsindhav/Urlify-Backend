const express = require('express')
const router = express.Router()

//Middleware
const { authantication } = require('../middleware/authantication')

//Controller
const user = require('../controllers/user.controllers')
const url = require('../controllers/url.controllers')
const admin = require('../controllers/admin.controllers')
const { authorization } = require('../middleware/authorization')

//API
router.get('/profile', authantication, user.profile)

router.post('/register', user.register)
router.post('/login', user.login)

router.get('/resetpassword', (req, res) => {
    try {
        const { token } = req.query;
        console.log(token)
        res.render('password-reset', { token: token });
    } catch (e) {
        throw Error("Error while geting password-reset template")
    }
})

router.post('/forgetpassword', user.forgetPassword)
router.post('/resetpassword', user.passwordReset)

router.post('/createshorturl', authantication, url.genrateURL)
router.post('/url/:id/getqrcode', authantication, url.generateQrcode)

router.get('/admin', authantication, authorization(true), admin.profile)
router.get('/admin/getalluser', authantication, authorization(true), admin.getAllUser)
router.get('/admin/getallurldetails', authantication, authorization(true), admin.getAllUrlDetails);
router.get('/user/url', authantication, user.getAllUrl)
router.get('/user/url/:id', authantication, user.getUrl)

router.patch('/profile/u', authantication, user.updateProfile)

router.delete('/profile/d/', authantication, user.deleteProfile) 
router.delete('/admin/user/d/', authantication, authorization(true), admin.deleteUser)
router.delete('/user/url/d', authantication, user.deleteUrl)
router.delete('/admin/url/d', authantication, authorization(true), admin.deleteUrl)

module.exports = router