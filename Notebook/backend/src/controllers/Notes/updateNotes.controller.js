import Note from "../../module/sticky-note.schema.js";
import Post from "../../module/post.schema.js";

async function updateNotes(req, res) {
    const { id, text, htmlCode, cssCode, jsCode, } = req.body

    try {
        let updatedNote = await Note.findOneAndUpdate(
            { _id: id, userId: req.user._id },
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

        // Posts carry a copy of the note, so keep that copy in step with edits.
        await Post.updateMany(
            { note: updatedNote._id },
            {
                noteSnapshot: {
                    title: updatedNote.title ?? "",
                    content: updatedNote.content ?? "",
                    html: updatedNote.html ?? "",
                    css: updatedNote.css ?? "",
                    javascript: updatedNote.javascript ?? "",
                },
            }
        );

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