const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    shortId: {
        type: String,
        required: true
    },
    redirectUrl: {
        type: String,
        required: true
    },
    qrcode: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isUnAuth: {
        type: Boolean,
        default: true
    },
    matric: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Matric" 
    }
}, { timestamps: true })

const URL = mongoose.model('URL', urlSchema)

module.exports = URL