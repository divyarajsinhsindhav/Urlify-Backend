const UAParser = require('ua-parser-js')
const Matric = require('../models/matric.models')

exports.createMetric = async (urlId) => {
    try {
        return Matric.create({
            matricOf: urlId
        });
    } catch (e) {
        throw Error("Error while create Matric")
    }
}

exports.updateMetric = async (urlId, userAgent) => {
    try {
        const parser = new UAParser()
        const uaResult = parser.setUA(userAgent).getResult();
        const metric = await Matric.findOneAndUpdate(
            { matricOf: urlId },
            { 
            $inc: { clickCount: 1 }, 
            $push: {
                analysis: {
                browser: uaResult.browser.name,
                os: uaResult.os.name
                }
            }
            }, 
            { new: true, upsert: true }
        );
        return metric;
    } catch (error) {
        throw new Error("Error updating metric click count: " + error.message);
    }
};