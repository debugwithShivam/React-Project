import multer from 'multer'
import path from 'path'
import fs from 'fs'

const musicPath = 'uploads/music'
const imagePath = 'uploads/images'

fs.mkdirSync(musicPath,{recursive:true})
fs.mkdirSync(imagePath,{recursive:true})

const storage = multer.diskStorage({
    destination(req,file,cd){
        if(file.fieldname == "music"){
          cd(null,musicPath);
        }else if(file.fieldname == "coverImage"){
            cd(null,imagePath)
        }
    },

    filename(req,file,cd){
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cd(null,uniqueName+path.extname(file.originalname));
    }
})

const upload = multer({ storage });

export default upload;