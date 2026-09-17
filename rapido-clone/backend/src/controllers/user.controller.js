import { getUserById } from '../services/user.service.js';

export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.user;
        console.log('USER ID:', userId);

        const user = await getUserById(userId);

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};