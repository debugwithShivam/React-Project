import { Router } from "express";
import {authenticateUser} from '../middleware/auth.middleware.js'
import { getMyProfile } from "../controllers/user.controller.js";

const userRouter = Router()

userRouter.get('/me',authenticateUser,getMyProfile)


export default userRouter