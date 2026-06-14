import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  Pasued: {
    type: Boolean
  },
  complet: {
    type: Boolean
  },
  duration: {
    type: Number
  },
  createdAt: {
    type: Date,
  },
  duration:{
    type:Number
  },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TodoPage",
    required: true
  },
  date:{
    type:String,
    require:true
  }
});

const todoPageSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
  },
  pageDescription: {
    type: String,
    required: true,
  },
  pagetag: {
    type: Array,
  },
  favourite:{
    type:Boolean
  },
  date:{
    type:String,
    require:true
  }
});



export const TodoPage = mongoose.model("TodoPage", todoPageSchema);
export const Todo = mongoose.model("Todo", todoSchema);