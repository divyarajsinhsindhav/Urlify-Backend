require('dotenv').config()
const { v2 } = require('cloudinary')
const fs = require('fs')

const cloudinary = v2

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });

        // Log the Cloudinary upload result
        console.log("File upload on Cloudinary:", uploadResult.url);
        fs.unlinkSync(localFilePath);
        // Return the Cloudinary upload result
        return uploadResult;
    } catch (error) {
        // Handle any errors that occur during Cloudinary upload
        console.error('Error occurred during Cloudinary upload:', error);
        
        // Remove the locally saved temporary file as the upload operation failed
        fs.unlinkSync(localFilePath);

        return null;
    }
};
