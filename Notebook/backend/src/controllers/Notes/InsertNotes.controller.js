import Note from "../../module/sticky-note.schema.js";
import jwt from 'jsonwebtoken'
import config from "../../config/EVConfig.js";

async function insertNotes(req, res) {
    const { title,type, textArea, htmlCode, cssCode, jsCode, } = req.body
    const accessToken = req.cookies.accessToken;
    console.log(req.body)

    try {
        let decoded = jwt.verify(accessToken, config.ACCESSTOKEN)
        let createNotes = await Note.create({
            userId: decoded.id,
            title: title,
            type:type,
            content: textArea,
            html: htmlCode,
            css: cssCode,
            javascript: jsCode,

        })
        
        await createNotes.save()
         return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: createNotes,
        });
    } catch (error) {
         console.log(error);
        return res.status(500).json({
            success:false,
            message:"Your Note Is note Save"
        })
    }


}

export default insertNotes