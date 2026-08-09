import mongoose from "mongoose";

const authDB = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    bio:{
        type:String,
        trim: true,
        required: false,
    },
    profilePicture:{
         type: String,
        default: null,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
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