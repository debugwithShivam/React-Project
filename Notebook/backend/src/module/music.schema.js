import mongoose from 'mongoose'

const musicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: false,
    trim: true,
    default: "Unknown Artist"
  },
  fileUrl: {
    type: String,
    required: true
  },
  fav:{
    type:Boolean,
    default:false
  },
  coverImage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Music = mongoose.model('Music', musicSchema);

export default Music;
