import express from 'express';
import { successResponse } from '../utils/response.js';

const router = express.Router();

router.get('/', (req, res) => {
    return successResponse(res, null, 'API running');
});

export default router;
