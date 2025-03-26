const User = require('../models/user.models')
const URL = require('../models/url.models')
const Matric = require('../models/matric.models')
const bcrypt = require('bcrypt')

exports.createUser = async (user) => {
    try {
        let hashPassword = await(bcrypt.hash(user.password, 10));
        const newUser = await User.create({
            username: user.username,
            email: user.email,
            password: hashPassword
        })
        return newUser;
    } catch (e) {
        throw Error("Error while creating user.")
    }
}

exports.getUserByEmail = async (email) => {
    try {
        let user = User.findOne({ email: email.toLowerCase().trim() })
        return user
    } catch (e) {
        throw Error("Error during getting user by email.")
    }
}

exports.getUserById = async (userId) => {
    try {
        return User.findById(userId)
    } catch (e) {
        throw Error("Error during getting user by Id")
    }
}

exports.getAllUser = async () => {
    try {
        return User.find()
    } catch (e) {
        throw Error("Error during get all user.")
    }
}

exports.updateUser = async (userId, body) => {
    try {
        return User.findByIdAndUpdate(userId, body, { new: true });
    } catch (e) {
        throw Error("Error while update the user.")
    }
}

exports.deleteUser = async (userId) => {
    try {
        const urls = await URL.find({ createdBy: userId });

        // Delete associated URLs and metrics
        for (const url of urls) {
            await Matric.deleteMany({ metricOf: url._id }); // Delete metrics
            await URL.findByIdAndDelete(url._id); // Delete URL
        }

        // Delete user
        await User.findByIdAndDelete(userId);
    } catch (error) {
        throw Error("Error whilr delete the user")
    }
}
