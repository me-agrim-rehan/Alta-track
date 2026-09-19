import express from "express";
import {
    getNextSubmission,
    createSubmission,
    getMySubmissions,
} from "../controllers/submissionController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get the question this user is currently allowed to submit
router.get(
    "/next",
    authMiddleware,
    getNextSubmission
);

// Submit LinkedIn + optional GitHub proof
router.post(
    "/",
    authMiddleware,
    createSubmission
);

// User's previous submissions
router.get(
    "/",
    authMiddleware,
    getMySubmissions
);

export default router;