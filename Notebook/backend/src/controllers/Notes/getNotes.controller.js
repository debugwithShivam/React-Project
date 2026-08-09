import Note from "../../module/sticky-note.schema.js";

async function getNotes(req,res){
    try{
        let notesData = await  Note.find({
            userId: req.user.id
        })
       return  res.status(200).json({
            success:true,
            message:"Data Was Found",
            data:notesData,
        })
    }catch(error){
     return res.status(500).json({
            success:false,
            message:"No Data Found"
        })
    }
}

export default getNotes