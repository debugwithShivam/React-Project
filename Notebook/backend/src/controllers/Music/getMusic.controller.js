import Music from "../../module/music.schema.js";
import config from "../../config/EVConfig.js";

async function  getMusic(req,res) {
    try{
        let musicData = await  Music.find({userId: req.user.id})
        console.log(musicData)
       return  res.status(200).json({
            success:true,
            message:"Data Was Found",
            data:musicData,
        })
    }catch(error){
        console.log(error)
     return res.status(500).json({
            success:false,
            message:"No Data Found"
        })
    }
}

export default getMusic