const UserServices = require('../services/user.services')
const URLServices = require('../services/url.services')

exports.profile = async (req, res) => {
    res.send({ message: "Welcome admin" })
}

exports.getAllUser = async (req, res) => {
    try {
        const User = await(UserServices.getAllUser())
        res.send({ data: User })
    } catch (e) {
        throw Error("Error during getting all user.")
    }
}

exports.getAllUrlDetails = async (req, res) => {
    try {
        const data = await(URLServices.getAllURLWithMetric())
        if (!data) res.send("Not any data available")
        return res.send({ data: data });
    } catch (e) {
        throw Error("Error while get all url details")
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.body.userid;
        const data = await(UserServices.deleteUser(userId));
        return res.send({ message: `User with ${userId} successfully deleted`, data: data  });
    } catch (e) {
        throw Error("Error while deleting user by Adminss")
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