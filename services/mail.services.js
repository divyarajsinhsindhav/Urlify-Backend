require('dotenv').config();
const nodemailer = require('nodemailer')

var auth = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD
    }
})

exports.forgetPassword = async (email, token, res) => {
    try {
        const recevier = {
            from: process.env.MAIL_ID,
            to: email,
            subject: "Reset your password",
            html: `<p>You have requested a password reset. Click <a href="http://localhost:${process.env.PORT}/api/v1/resetpassword?token=${token}">here</a> to reset your password.</p>`
        }
        auth.sendMail(recevier, (err, emailResponse) => {
            if (err) throw err;
            console.log("Mail send successfull")
            res.end();
        })
    } catch (e) {
        throw Error("Error while sending mail of reset password")
    }
}