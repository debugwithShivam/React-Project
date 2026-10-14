import Note from "../../module/sticky-note.schema.js";

async function deleteNotes(req, res) {
    const { id } = req.params; 
        try {
        const deletedNote = await Note.findOneAndDelete({
            _id: id,
            userId: req.user._id,
        });

        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        return res.status(200).json({
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


export default deleteNotes