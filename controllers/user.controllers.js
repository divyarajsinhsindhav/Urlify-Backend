require('dotenv').config();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserServices = require('../services/user.services')
const URLServices = require('../services/url.services')
const MailServices = require('../services/mail.services')
const MatricServices = require('../services/matric.services')
const { createAccessToken } = require('../services/authantication.services')

exports.register = async (req, res) => {
    try {
        let { email, username, password } = req.body;
        email = email.toLowerCase().trim();

        let existingUser = await UserServices.getUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: "User already exists with that email" });

        let newUser = await UserServices.createUser({ username, email, password });
        return res.status(201).json({ data: newUser, message: "User created successfully." });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Issue with creating user" });
    }
};


exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const User = await UserServices.getUserByEmail(email.toLowerCase().trim());
        if (!User) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        const checkPassword = await bcrypt.compare(password, User.password);
        if (!checkPassword) {
            return res.status(401).json({ status: 401, message: "Incorrect password" });
        }

        const token = createAccessToken(User._id, User.isAdmin);
        return res.status(200).json({ status: 200, message: "Login successful", data: User, token });
    } catch (e) {
        console.error("Login error:", e);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};

exports.profile = async (req, res) => {
    try {
        if (!req.userId) return res.send({ message: "You need to login" })
        const User = await UserServices.getUserById(req.userId)
        if (!User) return res.send({ message: "User not found." })
        const urls = await(URLServices.findURLByUser(req.userId))
        return res.send({ message: "Successfully geting the user.", data: User, urls: urls })
    } catch (e) {
        throw Error('Error during getting profile')
    }
}

exports.getAllUrl = async (req, res) => {
    try {
        const userId = req.userId;
        const data = await URLServices.findURLByUser(userId)
        if(!data) return res.send({ message: "Data not found." })
        return res.send({ message: "Getting url successfully", data: data })
    } catch (e) {
        throw Error("Error while getting all Url")
    }
}

exports.getUrl = async (req, res) => {
    try{
        const urlId = req.params.id;
        const data = await (URLServices.getUrlWithMetric(urlId))
        if(!data) return res.send({ message: "Data not found" })
        return res.send({ data: data })
    } catch (e) {
        throw new Error("Error while get url" + e)
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId
        const body = req.body;
        const updatedData = await UserServices.updateUser(userId, body);
        return res.send({ message: "Your profile update successfully.", data: updatedData })
    } catch (e) {
        throw Error("Error while update profile.")
    }
}

exports.deleteProfile = async (req, res) => {
    try {
        const data = UserServices.deleteUser(req.userId);
        return res.send({ message: "Your profile successfully deleted", data: data })
    } catch (e) {
        throw Error("Error while delete the user.")
    }
}

exports.deleteUrl = async (req, res) => {
    try {
        const urlId = req.body.urlid
        const data = await URLServices.deleteURL(urlId);
        return res.send({ message: "Delete the URL successfully", data: data })
    } catch (e) {
        throw Error("Error while delete the URL by Admin")
    }
}

exports.forgetPassword = async (req, res) => {
    try {
        const body = req.body;
        const email = body.email;
        const user = await(UserServices.getUserByEmail(email))
        if (!user) return res.send({ message: "User not found" });
        // console.log("Hell0")
        const token = jwt.sign({ email }, process.env.RESET_PASSWORD_TOKEN, { expiresIn: '1h' })
        MailServices.forgetPassword(email, token, res);
        return res.send({ message: "Check your mail box and reset password" });
    } catch (e) {
        throw Error("Error while handle forget password")
    }
}

exports.passwordReset = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.RESET_PASSWORD_TOKEN)
        const email  = decoded.email
        const user = await UserServices.getUserByEmail(email)
        if(!user) return res.send("Please try again")
        const hashPassword = await bcrypt.hash(newPassword, 10)
        await UserServices.updateUser(user._id, { password: hashPassword })
        return res.send({ message: "Password successfully updated" })
    } catch (e) {
        throw Error("Error while reset the password")
    }
}