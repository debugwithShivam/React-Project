import mongoose from "mongoose";

let taskSchema = new mongoose.Schema({
    searchInput: {
        type: String,
        required: true,
        trim: true,
    },
    currantDate: {
        type: String,
        required: true,
    },
    paused: {
        type: Boolean
    },
    complet: {
        type: Boolean
    },
     isDisabled: {
        type: Boolean,
        default: false,
    },
    duration: {
        type:Number,
    },
})

const task = mongoose.model('Task', taskSchema)

export default task;


