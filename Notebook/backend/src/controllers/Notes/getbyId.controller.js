import Note from "../../module/sticky-note.schema.js";

async function noteDataGetById(req,res){
    const { id } = req.params; 
    console.log(id)
    try{
        let notesData = await  Note.findById(id)
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

export default noteDataGetById