import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'node:url'

const musicPath = fileURLToPath(new URL('../../uploads/music', import.meta.url))
const imagePath = fileURLToPath(new URL('../../uploads/images', import.meta.url))

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
