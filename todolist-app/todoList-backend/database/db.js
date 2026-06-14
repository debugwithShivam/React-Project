import mongoose from "mongoose";

export  const connectDataBase = async () =>{
    try{
        const connect = await mongoose.connect('mongodb://127.0.0.1:27017/searchItem')
    }catch(err){
        console.log(err)
    }
}