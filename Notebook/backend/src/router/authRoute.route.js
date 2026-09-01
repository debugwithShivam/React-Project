import { Router } from 'express';

// authentication Router
import authorization from '../controllers/Auth/auth.Controller.js';
import verifyOtp from '../controllers/Auth/VerifyOtp.Controller.js';
import singIn from '../controllers/Auth/SingIn.controller.js';

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

// Account
import searchUsers from '../controllers/Account/searchUsers.controller.js';
import getProfile from '../controllers/Account/getProfile.controller.js';

// Follow
import followUser from '../controllers/User/follow/followUser.controller.js';
import getFollowStatus from '../controllers/User/follow/getFollowStatus.controller.js';
import unFollowUser from '../controllers/User/follow/unFollowUser.controller.js';

// Convertions
import getOrCreateConversation from '../controllers/User/Conversation/getOrCreateConversation.Controller.js';
import sendMessage from '../controllers/User/Conversation/sendMessage.controller.js';
import getMessages from '../controllers/User/Conversation/getMessages.controller.js';
import markMessagesAsRead from '../controllers/User/Conversation/markMessagesAsRead.controller.js';
import getUnreadCounts from '../controllers/User/Conversation/getUnreadCounts.controller.js';

const authRouter = Router();




authRouter.get('/check-auth', tookenChecker, (req, res) => {
    res.status(200).json({
        authenticated: true,
        user: {
                id: req.user._id,
                name: req.user.name,
                username: req.user.username,
                email: req.user.email,
            },
    });
})
// Get Requets
authRouter.get('/getNotes', tookenChecker, getNotes)
authRouter.get('/noteDataGetById/:id', tookenChecker, noteDataGetById)
authRouter.get('/getMusic', tookenChecker, getMusic)
authRouter.get('/searchUsers', tookenChecker, searchUsers)
authRouter.get("/follow-status/:userId",tookenChecker,getFollowStatus)
authRouter.get("/profile",tookenChecker,getProfile)
authRouter.get("/messages/unread",tookenChecker,getUnreadCounts);
authRouter.get("/messages/:conversationId",tookenChecker,getMessages);

// POST Requets
authRouter.post('/createAccount', authorization)
authRouter.post('/singIn', singIn)
authRouter.post('/insertNotes', tookenChecker, insertNotes)
authRouter.post('/VerifOtp', verifyOtp)
authRouter.post('/uploadMusic', tookenChecker, upload.fields([
    { name: "music", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]), uploadMusic)
authRouter.post('/follow/:userId',tookenChecker,followUser)
authRouter.post("/conversation/:userId",tookenChecker,getOrCreateConversation);
authRouter.post("/message",tookenChecker,sendMessage);

//patch request 
authRouter.patch('/updateNotes', updateNotes)
authRouter.patch('/updateMusic', updateMusic)
authRouter.patch("/messages/:conversationId/read",tookenChecker,markMessagesAsRead);


//delete request 
authRouter.delete('/deleteMusic/:id', deleteMusic)
authRouter.delete('/deleteNotes/:id', deleteNotes)
authRouter.delete('/unfollow/:userId',tookenChecker, unFollowUser)


export default authRouter