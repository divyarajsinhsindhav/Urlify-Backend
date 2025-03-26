const { updateMetric } = require('../services/matric.services');
const URLServices = require('../services/url.services')
const MatricServices = require('../services/matric.services')
const { uploadOnCloudinary } = require('../services/cloudinary.services')
const QRCode = require('qrcode');
const fs = require('fs')
const path = require('path');
const redisClient = require('../services/redis');

exports.genrateURL = async (req, res) => {
    try {
        const { redirectUrl } = req.body;
        console.log(req.body)
        const createdBy = req.userId;
        const isUnAuth = false;
        
        if (!redirectUrl) return res.status(400).json({ message: "URL is required" });

        const data = await URLServices.createURLwithAuth(redirectUrl, createdBy, isUnAuth);
        const matricId = await MatricServices.createMetric(data._id);
        await URLServices.updateURLById(data._id, { matric: matricId });

        return res.status(201).json({ message: "URL successfully generated.", data });
    } catch (error) {
        res.status(500).json({ message: "Error generating URL", error: error.message });
    }
};


exports.genrateURLwithoutAuth = async (req, res) => {
    try {
        const originalURL = req.body.redirectUrl
        const isUnAuth = true        
        const data = await(URLServices.createURL(originalURL, isUnAuth));
        await MatricServices.createMetric(data._id);
        return res.send({ message: "Successfully url is genrated.", data: data })
    } catch (e) {
        throw Error("Error while genrating URL.")
    }
}

exports.generateQrcode = async (req, res) => {
    try {
        const urlId = req.params.id;
        const data = await URLServices.getURLbyId(urlId); // Await the promise
        const shortId = data.shortId;
        const url = `http://localhost:3000/${shortId}`;
        const directoryPath = path.resolve(__dirname, '../public/qrcode');
        const filePath = path.resolve(directoryPath, 'file.png');

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        await QRCode.toFile(filePath, url, {
            errorCorrectionLevel: 'H'
        });

        const qrCodeDataURL = await QRCode.toDataURL(url);

        const uploadResult = await uploadOnCloudinary(filePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            console.error("File does not exist, cannot delete:", filePath);
        }

        console.log('QR code uploaded to Cloudinary:', uploadResult);
        console.log('QR code data URL:', qrCodeDataURL);

        const qrCodeUrl = uploadResult.secure_url;
        await URLServices.updateURLById(urlId, { qrcode: qrCodeUrl });

        return res.send({ uploadResult, qrCodeDataURL, data });
    } catch (error) {
        console.error("Error while generating QR code: ", error);
        res.status(500).json({ error: "Error while generating QR code" });
    }
};

exports.clickOnUrl = async (req, res) => {
    try {
        const shortId = req.params.shortId; // Get the shortId from the URL
        const cacheKey = `url_${shortId}`; // Define the cache key

        // Try to fetch the URL from Redis cache
        const cachedUrl = await redisClient.get(cacheKey);
        if (cachedUrl) {
            const url = JSON.parse(cachedUrl); // Parse the cached data
            await updateMetric(url._id, req.headers['user-agent']);
            return res.redirect(url.redirectUrl); // Redirect to the cached URL
        }

        // If not in cache, fetch from the database
        const url = await URLServices.findURL(shortId);
        if (!url) {
            return res.status(404).json({ message: "URL not found" }); // Send 404 if URL not found
        }

        // Save the URL in the Redis cache for faster access next time
        await redisClient.setEx(cacheKey, 432000, JSON.stringify(url)); // Cache for 1 hour

        await updateMetric(url._id, req.headers['user-agent']);

        // Redirect to the actual URL
        res.redirect(url.redirectUrl);
    } catch (error) {
        console.error("Error in clickOnUrl:", error); // Log the error for debugging
        res.status(500).json({ error: "Something went wrong" }); // Return generic error response
    }
};


