import { asyncHandler } from '../utils/apiError.js';
import * as place from '../services/place.service.js';

export const listPlacesController = asyncHandler(async (req, res) => {
    const places = await place.listPlaces(req.user.user);
    res.json({ success: true, places });
});

export const addPlaceController = asyncHandler(async (req, res) => {
    const { label, name, address, lat, lng } = req.body;
    const saved = await place.addPlace({
        userId: req.user.user,
        label,
        name,
        address,
        lat: lat != null && lat !== '' ? Number(lat) : null,
        lng: lng != null && lng !== '' ? Number(lng) : null,
    });
    res.status(201).json({ success: true, place: saved });
});

export const deletePlaceController = asyncHandler(async (req, res) => {
    const result = await place.deletePlace(req.params.id, req.user.user);
    res.json({ success: true, ...result });
});
