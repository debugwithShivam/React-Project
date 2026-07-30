import mongoose from "mongoose";

const authDB = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        default: null
    },

    otp: String,

    otpExpire: Date,

    isVerified: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

const userAuth = mongoose.model("Login", authDB);

export default userAuth