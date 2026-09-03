import Music from "../../module/music.schema.js";
import config from "../../config/EVConfig.js";

async function  deleteMusic(req,res) {
    const {id} = req.params;
     try {
        await Music.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Note deleted"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export default deleteMusic