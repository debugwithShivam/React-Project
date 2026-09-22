import { asyncHandler } from '../utils/apiError.js';
import * as v from '../services/vehicle.service.js';
import * as c from '../services/city.service.js';

export const listVehiclesController = asyncHandler(async (req, res) => {
    const vehicles = await v.listVehicleTypes({ includeInactive: req.query.includeInactive === 'true' });
    res.json({ success: true, vehicles });
});

export const listCitiesController = asyncHandler(async (req, res) => {
    const cities = await c.listCities({ includeInactive: req.query.includeInactive === 'true' });
    res.json({ success: true, cities });
});
