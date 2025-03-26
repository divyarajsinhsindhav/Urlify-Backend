const URL = require('../models/url.models')
const Matric = require('../models/matric.models')
const crypto = require('crypto')
const mongoose = require('mongoose')

const generateShortUrl = async () => {
    const NUM_CHARS_SHORT_LINK = 7;
    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = '';
    while (true) {
        for (let i = 0; i < NUM_CHARS_SHORT_LINK; i++) {
            const randomByte = crypto.randomInt(0, ALPHABET.length - 1);
            result += ALPHABET.charAt(randomByte);
        }
        // make sure the short link isn't already used
        const isExist = await URL.findOne({ result });
        if (!isExist) {
            return result;
        }
    }
}

exports.createURLwithAuth = async (originalURL, userId, isUnAuth) => {
    try {
        const shortId = await generateShortUrl();
        return URL.create({
            shortId: shortId,
            redirectUrl: originalURL,
            createdBy: userId,
            isUnAuth: isUnAuth
        });
    } catch (e) {
        throw Error("Error while creating Short URL");
    }
}

exports.createURL = async (originalURL, isUnAuth) => {
    try {
        const shortId = await generateShortUrl();
        return URL.create({
            shortId: shortId,
            redirectUrl: originalURL,
            isUnAuth: isUnAuth
        });
    } catch (e) {
        throw Error("Error while creating Short URL");
    }
}

exports.findURL = async (shortId) => {
    try {
        return URL.findOne({ shortId: shortId });
    } catch (e) {
        throw Error("Error during finding URL");
    }
}

exports.findURLByUser = async (userId) => {
    try {
        return URL.find({ createdBy: userId })
            .populate({
                path: "matric",
                select: "clickCount",
            }).exec();
    } catch (e) {
        throw Error("Error while find url by user")
    }
}

exports.getUrlWithMetric = async (urlId) => {
    try { 
        const objectId = new mongoose.Types.ObjectId(urlId); 
        const result = URL.aggregate([
            {
                $match: { _id: objectId }
            },
            {
                $lookup: {
                    from: "matrics",
                    localField: "_id",
                    foreignField: "matricOf",
                    as: "Matric",
                    pipeline: [
                        {
                            $project: {
                                clickCount: 1,
                                analysis: 1
                            }
                        }
                    ]
                }
            }
        ]);

        return result;
    } catch (e) {
        throw Error("Error while getting URL." + e)
    }
}

exports.getAllURLWithMetric = async () => {
    try {
        return URL.aggregate([
            {
                $lookup: {
                    from: "matrics",                 
                    localField: "_id",              
                    foreignField: "matricOf",       
                    as: "Matric",
                    pipeline: [{
                        $project: {
                            clickCount: 1,
                            analysis: 1
                        }
                    }]
                }
            }
        ]);
    } catch (e) {
        throw Error("Error while get all urls with metric")
    }
}

exports.getURLbyId = async (urlId) => {
    try {
        return URL.findById(urlId)
    } catch (e) {
        throw Error("Error while getting url using id", e)
    }
}

exports.updateURLById = async (id, updateData) => {
    try {
        return await URL.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
        throw new Error('Error updating URL: ' + error.message);
    }
};

exports.deleteURL = async (urlId) => {
    try {
        const url = await URL.findById(urlId);
        if (!url) {
            return res.send({ message: "URL not found" });
        }
        const metrics = await Matric.find({ metricOf: urlId });
        await Matric.findByIdAndDelete(metrics._id);
        await URL.findByIdAndDelete(urlId);
    } catch (e) {
        throw Error("Error while delete the URL")
    }
}