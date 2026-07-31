import {Router} from 'express';
import authorization from '../controllers/Auth/auth.Controller.js';
import verifyOtp from '../controllers/Auth/VerifyOtp.Controller.js';
import checkAuth from '../controllers/Auth/CheckAuth.Controller.js';

const authRouter = Router();

authRouter.get('/check-auth',checkAuth,(req,res)=>{
     res.status(200).json({
        authenticated: true,
        user: req.user,
    });
})
authRouter.post('/createAccount',authorization)
authRouter.post('/VerifOtp',verifyOtp)

export default authRouter