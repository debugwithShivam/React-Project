import { Router } from 'express';
import { listVehiclesController, listCitiesController } from '../controllers/vehical.controller.js';

const router = Router();
router.get('/vehicles', listVehiclesController);
router.get('/cities', listCitiesController);
export default router;
