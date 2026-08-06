import {Router} from 'express';

// authentication Router
import authorization from '../controllers/Auth/auth.Controller.js';
import verifyOtp from '../controllers/Auth/VerifyOtp.Controller.js';

// Notes Router
import insertNotes from '../controllers/Notes/InsertNotes.controller.js';
import getNotes from '../controllers/Notes/getNotes.controller.js';
import deleteNotes from '../controllers/Notes/deleteNotes.controller.js';
import noteDataGetById from '../controllers/Notes/getbyId.controller.js';
import updateNotes from '../controllers/Notes/updateNotes.controller.js';

// Music Router
import uploadMusic from '../controllers/Music/uploadMusic.controller.js';
import updateMusic from '../controllers/Music/updateMusic.controller.js';
import deleteMusic from '../controllers/Music/deleteMusic.controller.js';
import getMusic from '../controllers/Music/getMusic.controller.js';

// Middleware
import upload from '../middleware/upload.js';
import tookenChecker from '../middleware/authMiddleware.js';

const authRouter = Router();

authRouter.get('/check-auth',tookenChecker,(req,res)=>{
     res.status(200).json({
        authenticated: true,
        user: req.user,
    });
})
// Get Requets
authRouter.get('/getNotes',getNotes)
authRouter.get('/noteDataGetById/:id',noteDataGetById)
authRouter.get('/getMusic',getMusic)

// POST Requets
authRouter.post('/createAccount',authorization)
authRouter.post('/insertNotes',insertNotes)
authRouter.post('/VerifOtp',verifyOtp)
authRouter.post('/uploadMusic',tookenChecker,upload.fields([
    {name:"music",maxCount:1},
    {name:"coverImage",maxCount:1},
]),uploadMusic)

//patch request 
authRouter.patch('/updateNotes',updateNotes)
authRouter.patch('/updateMusic',updateMusic)


//delete request 
authRouter.delete('/deleteMusic/:id',deleteMusic)
authRouter.delete('/deleteNotes/:id',deleteNotes)


export default authRouter