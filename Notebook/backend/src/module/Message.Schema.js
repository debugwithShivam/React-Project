import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversation:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Conversation",
            required:true
        },
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Login",
            reduired:true
        },
        receiver:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Login",
            reduired:true
        },
        content:{
            type:String,
            required:true,
            trim:true,
        },
        read:{
            type:Boolean,
            default:false
        },
        readAt:{
            type:Date,
            default:null
        }
    },{timestamps:true}
)

messageSchema.index({ conversation: 1, receiver:1,readAt:1 });

const Message = mongoose.model(
    "Message",
    messageSchema
);

export default Message;