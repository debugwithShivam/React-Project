import { Router } from "express";
import { authenticateUser,requireRole } from '../middleware/auth.middleware.js'

const profileRouter = Router()

profileRouter.get('/profile', authenticateUser, (req, res) => {
    return res.json({
        success: true,
        message: 'You are authenticated',
        user: req.user
    })
})

profileRouter.get('/admin-test',authenticateUser,requireRole('ADMIN'),(req, res) => {
        res.json({
            success: true,
            message: 'Welcome Admin',
            user: req.user.user
        });
    }
);

export default profileRouter