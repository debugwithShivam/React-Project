import { Router } from 'express';

// authentication Router
import authorization from '../controllers/Auth/auth.Controller.js';
import verifyOtp from '../controllers/Auth/VerifyOtp.Controller.js';
import singIn from '../controllers/Auth/SingIn.controller.js';
import logout from '../controllers/Auth/logout.controller.js';

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
import upload, { uploadAvatar, uploadPostMedia } from '../middleware/upload.js';
import tookenChecker from '../middleware/authMiddleware.js';

// Account
import searchUsers from '../controllers/Account/searchUsers.controller.js';
import getProfile from '../controllers/Account/getProfile.controller.js';
import updateProfile from '../controllers/Account/updateProfile.controller.js';

// Posts
import createPost from '../controllers/Post/createPost.controller.js';
import deletePost from '../controllers/Post/deletePost.controller.js';
import togglePostLike from '../controllers/Post/toggleLike.controller.js';
import getPostById from '../controllers/Post/getPostById.controller.js';
import addPostComment from '../controllers/Post/addComment.controller.js';
import deletePostComment from '../controllers/Post/deleteComment.controller.js';
import getPostComments from '../controllers/Post/getComments.controller.js';

// Follow
import followUser from '../controllers/User/follow/followUser.controller.js';
import getFollowStatus from '../controllers/User/follow/getFollowStatus.controller.js';
import unFollowUser from '../controllers/User/follow/unFollowUser.controller.js';

// Convertions
import getOrCreateConversation from '../controllers/User/Conversation/getOrCreateConversation.Controller.js';
import sendMessage from '../controllers/User/Conversation/sendMessage.controller.js';
import getMessages from '../controllers/User/Conversation/getMessages.controller.js';
import getConversations from '../controllers/User/Conversation/getConversations.controller.js';
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
                bio: req.user.bio,
                profilePicture: req.user.profilePicture,
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
authRouter.get("/profile/:userId",tookenChecker,getProfile)
authRouter.get("/post/:id",tookenChecker,getPostById)
authRouter.get("/comments/:id", tookenChecker, getPostComments)
authRouter.get("/messages/unread",tookenChecker,getUnreadCounts);
authRouter.get("/conversations",tookenChecker,getConversations);
authRouter.get("/messages/:conversationId",tookenChecker,getMessages);

// POST Requets
authRouter.post('/createAccount', authorization)
authRouter.post('/singIn', singIn)
authRouter.post('/logout', logout)
authRouter.post('/insertNotes', tookenChecker, insertNotes)
// authRouter.post('/VerifOtp', verifyOtp)
authRouter.post('/uploadMusic', tookenChecker, upload.fields([
    { name: "music", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]), uploadMusic)
authRouter.post('/follow/:userId',tookenChecker,followUser)
authRouter.post("/conversation/:userId",tookenChecker,getOrCreateConversation);
authRouter.post("/message",tookenChecker,sendMessage);
authRouter.post('/createPost', tookenChecker, uploadPostMedia, createPost)
authRouter.post('/likePost/:id', tookenChecker, togglePostLike)
authRouter.post('/comment/:id', tookenChecker, addPostComment)
authRouter.delete('/comment/:id', tookenChecker, deletePostComment)

//patch request 
authRouter.patch('/updateNotes', tookenChecker, updateNotes)
authRouter.patch('/updateMusic', tookenChecker, updateMusic)
authRouter.patch("/messages/:conversationId/read",tookenChecker,markMessagesAsRead);
authRouter.patch('/updateProfile', tookenChecker, uploadAvatar, updateProfile)


//delete request 
authRouter.delete('/deleteMusic/:id', tookenChecker, deleteMusic)
authRouter.delete('/deleteNotes/:id', tookenChecker, deleteNotes)
authRouter.delete('/unfollow/:userId',tookenChecker, unFollowUser)
authRouter.delete('/post/:id', tookenChecker, deletePost)


export default authRouter