import Note from "../../module/sticky-note.schema.js";

async function deleteNotes(req, res) {
    const { id } = req.params; 
        try {
        await Note.findByIdAndDelete(id);
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


export default deleteNotes