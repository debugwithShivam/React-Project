import { createRide } from '../services/ride.service.js';

export const createRideController = async (req, res) => {
    try {
        const {
            pickupTitle,
            pickupAddress,
            dropTitle,
            dropAddress,
            vehicleType,
            distance,
            duration,
            fare,
            paymentMethod,
        } = req.body;

        if (
            !pickupTitle ||
            !pickupAddress ||
            !dropTitle ||
            !dropAddress ||
            !fare
        ) {
            return res.status(400).json({
                success: false,
                message: 'Pickup, drop, and fare are required',
            });
        }

        const ride = await createRide({
            userId: req.user.user,
            pickupTitle,
            pickupAddress,
            dropTitle,
            dropAddress,
            vehicleType,
            distance,
            duration,
            fare,
            paymentMethod,
        });

        return res.status(201).json({
            success: true,
            message: 'Ride created successfully',
            ride,
        });
    } catch (error) {
        console.error('CREATE RIDE ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to create ride',
        });
    }
};