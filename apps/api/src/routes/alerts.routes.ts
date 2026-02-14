import { Router } from 'express';
import { listAlerts, addAlert } from '../controllers/alerts.controller';

const router = Router();

router.get('/', listAlerts);
router.post('/', addAlert);

export default router;
