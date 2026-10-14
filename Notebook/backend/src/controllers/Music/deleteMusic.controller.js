import Music from "../../module/music.schema.js";

async function  deleteMusic(req,res) {
    const {id} = req.params;
     try {
        const deletedTrack = await Music.findOneAndDelete({
            _id: id,
            userId: req.user._id,
        });

        if (!deletedTrack) {
            return res.status(404).json({
                success: false,
                message: "Track not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Track deleted"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export default deleteMusic