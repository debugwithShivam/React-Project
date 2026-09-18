import { getUserById } from '../services/user.service.js';

export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.user;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authenticated user id is missing'
            });
        }

        const user = await getUserById(userId);

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);

        const statusCode = error.message === 'User not found' ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};