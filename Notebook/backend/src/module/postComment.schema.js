import mongoose from "mongoose";

const postCommentSchema = new mongoose.Schema(
    {
        post:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            required:true
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Login",
            required:true
        },
        text:{
            type:String,
            required:true,
            trim:true,
            maxlength:500
        }
    },
    {timestamps:true}
);

postCommentSchema.index({post:1,createdAt:1});

const PostComment = mongoose.model("PostComment",postCommentSchema)

export default PostComment
