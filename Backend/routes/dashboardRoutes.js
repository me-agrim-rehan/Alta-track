import express from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getChallengeState,
  processMissedDay,
} from "../services/challengeService.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const email = req.user.email;

    // 1. Process any missed challenge day first
    await processMissedDay(req.user.id, req.user.email);

    // 2. Get the current challenge state
    const challenge = await getChallengeState(req.user.id, req.user.email);

    // 3. Get all questions and their solved status
    const result = await pool.query(
      `
      SELECT 
        q.id,
        q.problem,
        q.description,
        sq.solved_at
      FROM questions q
      LEFT JOIN solved_questions sq
        ON q.id = sq.question_id
        AND LOWER(sq.email) = LOWER($1)
      ORDER BY q.id;
      `,
      [email],
    );

    const questions = result.rows.map((question) => ({
      id: question.id,
      problem: question.problem,
      description: question.description,
      solved: question.solved_at !== null,
      solvedAt: question.solved_at,
    }));

    // 4. Send ONE response
    return res.status(200).json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        campus: req.user.campus,
        year: req.user.year,
        program: req.user.program,
      },

      progress: {
        total: questions.length,
        solved: challenge.solved,
        remaining: questions.length - challenge.solved,
      },

      challenge,

      questions,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
});

export default router;
