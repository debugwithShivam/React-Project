import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
    {
        follower:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Login",
            required:true
        },
        following:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Login",
            required:true
        }
    },
    {timestamps:true}
);

followSchema.index(
    {follower:1,following:1},
    {unique:true}
);

const Follow = mongoose.model("Follow",followSchema)

export default Follow