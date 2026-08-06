import Note from "../../module/sticky-note.schema.js";
import jwt from 'jsonwebtoken'
import config from "../../config/EVConfig.js";

async function updateNotes(req, res) {
    const { id, text, htmlCode, cssCode, jsCode, } = req.body
    const accessToken = req.cookies.accessToken;
    console.log(req.body)

    try {
        let updatedNote = await Note.findByIdAndUpdate(
            id,
            {
                content: text,
                html: htmlCode,
                css: cssCode,
                javascript: jsCode
            },
            { new: true }
        )

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: updatedNote,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Your Note could not be saved",
        });
    }


}

export default updateNotes