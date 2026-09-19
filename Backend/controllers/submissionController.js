import pool from "../db.js";

/*
|--------------------------------------------------------------------------
| GET /submissions/next
|--------------------------------------------------------------------------
| Determines which question the authenticated user is allowed to submit.
|
| Rules:
| - User does not choose the question.
| - Next question = number of solved questions + 1.
| - First submission after solving previous question:
|     next calendar day = normal
|     second calendar day = allowed + 1 flag
|     third calendar day = reset required
|--------------------------------------------------------------------------
*/

export async function getNextSubmission(req, res) {
  try {
    const userEmail = req.user.email;

    // ----------------------------------------------------------
    // 1. Get user's solved questions
    // ----------------------------------------------------------

    const solvedResult = await pool.query(
      `
            SELECT
                question_id,
                solved_at
            FROM solved_questions
            WHERE LOWER(email) = LOWER($1)
            ORDER BY solved_at ASC
            `,
      [userEmail],
    );

    const solvedQuestions = solvedResult.rows;

    // ----------------------------------------------------------
    // 2. Determine next question
    // ----------------------------------------------------------

    const solvedCount = solvedQuestions.length;
    const nextQuestionId = solvedCount + 1;

    // Challenge complete
    if (nextQuestionId > 111) {
      return res.status(200).json({
        canSubmit: false,
        status: "completed",
        message: "You have completed all 111 questions.",
      });
    }

    // ----------------------------------------------------------
    // 3. If user has solved nothing, first question is available
    // ----------------------------------------------------------

    if (solvedCount === 0) {
      const questionResult = await pool.query(
        `
                SELECT
                    id,
                    problem,
                    description
                FROM questions
                WHERE id = $1
                `,
        [nextQuestionId],
      );

      if (questionResult.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }

      return res.status(200).json({
        canSubmit: true,
        status: "available",
        late: false,
        flagWillBeAdded: false,
        question: questionResult.rows[0],
      });
    }

    // ----------------------------------------------------------
    // 4. Find when the previous question was solved
    // ----------------------------------------------------------

    const lastSolved = solvedQuestions[solvedQuestions.length - 1];

    const solvedAt = new Date(lastSolved.solved_at);

    // Convert both dates to IST calendar dates
    const solvedDateIST = solvedAt.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const todayDateIST = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    // Convert YYYY-MM-DD into UTC dates purely for calendar-day comparison
    const solvedDate = new Date(`${solvedDateIST}T00:00:00Z`);
    const todayDate = new Date(`${todayDateIST}T00:00:00Z`);

    const daysSinceSolved = Math.round(
      (todayDate - solvedDate) / (24 * 60 * 60 * 1000),
    );

    // ----------------------------------------------------------
    // 5. Day 0
    // ----------------------------------------------------------

    if (daysSinceSolved === 0) {
      const questionResult = await pool.query(
        `
    SELECT
      id,
      problem,
      description
    FROM questions
    WHERE id = $1
    `,
        [nextQuestionId],
      );

      if (questionResult.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }

      return res.status(200).json({
        canSubmit: false,
        status: "wait",
        late: false,
        flagWillBeAdded: false,
        nextAvailableDate: "tomorrow",
        question: questionResult.rows[0],
        message:
          "You have already completed today's question. You can submit the next question tomorrow.",
      });
    }

    // ----------------------------------------------------------
    // 6. Day 1
    // ----------------------------------------------------------

    if (daysSinceSolved === 1) {
      const questionResult = await pool.query(
        `
                SELECT
                    id,
                    problem,
                    description
                FROM questions
                WHERE id = $1
                `,
        [nextQuestionId],
      );

      if (questionResult.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }

      return res.status(200).json({
        canSubmit: true,
        status: "available",
        late: false,
        flagWillBeAdded: false,
        question: questionResult.rows[0],
      });
    }

    // ----------------------------------------------------------
    // 7. Day 2
    // ----------------------------------------------------------

    if (daysSinceSolved === 2) {
      const questionResult = await pool.query(
        `
                SELECT
                    id,
                    problem,
                    description
                FROM questions
                WHERE id = $1
                `,
        [nextQuestionId],
      );

      if (questionResult.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }

      return res.status(200).json({
        canSubmit: true,
        status: "grace_period",
        late: true,
        flagWillBeAdded: true,
        question: questionResult.rows[0],
        message:
          "You are submitting during the grace period. One flag will be added.",
      });
    }

    // ----------------------------------------------------------
    // 8. Day 3+
    // ----------------------------------------------------------

    // ----------------------------------------------------------
    // 8. Day 3+
    // ----------------------------------------------------------

    // ----------------------------------------------------------
    // 8. Day 3+
    // ----------------------------------------------------------

    const questionResult = await pool.query(
      `
    SELECT
      id,
      problem,
      description
    FROM questions
    WHERE id = $1
  `,
      [1],
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Question 1 not found.",
      });
    }

    return res.status(200).json({
      canSubmit: true,
      status: "reset_required",
      late: true,
      flagWillBeAdded: false,
      question: questionResult.rows[0],
      message:
        "You missed the submission window. Your challenge must restart from Question 1.",
    });
  } catch (error) {
    console.error("Get next submission error:", error);

    return res.status(500).json({
      message: "Failed to determine next submission.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| POST /submissions
|--------------------------------------------------------------------------
| Creates a submission for the question determined by the backend.
|--------------------------------------------------------------------------
*/

export async function createSubmission(req, res) {
  const client = await pool.connect();

  try {
    const userEmail = req.user.email;
    const userId = req.user.id;

    const { linkedinUrl, githubUrl } = req.body;

    // ----------------------------------------------------------
    // 1. Validate required LinkedIn URL
    // ----------------------------------------------------------

    if (!linkedinUrl || !linkedinUrl.trim()) {
      return res.status(400).json({
        message: "LinkedIn post URL is required.",
      });
    }

    // ----------------------------------------------------------
    // 2. Basic URL validation
    // ----------------------------------------------------------

    let linkedin;

    try {
      linkedin = new URL(linkedinUrl.trim());
    } catch {
      return res.status(400).json({
        message: "Invalid LinkedIn URL.",
      });
    }

    const isLinkedIn =
      linkedin.protocol === "https:" &&
      (linkedin.hostname === "linkedin.com" ||
        linkedin.hostname === "www.linkedin.com" ||
        linkedin.hostname === "lnkd.in");

    if (!isLinkedIn) {
      return res.status(400).json({
        message: "Please provide a valid LinkedIn post URL.",
      });
    }

    // ----------------------------------------------------------
    // 3. Validate optional GitHub URL
    // ----------------------------------------------------------

    let github = null;

    if (githubUrl && githubUrl.trim()) {
      try {
        github = new URL(githubUrl.trim());
      } catch {
        return res.status(400).json({
          message: "Invalid GitHub URL.",
        });
      }

      if (
        github.protocol !== "https:" ||
        !github.hostname.includes("github.com")
      ) {
        return res.status(400).json({
          message: "Please provide a valid GitHub URL.",
        });
      }
    }

    await client.query("BEGIN");

    // ----------------------------------------------------------
    // 4. Get solved questions
    // ----------------------------------------------------------

    const solvedResult = await client.query(
      `
            SELECT
                question_id,
                solved_at
            FROM solved_questions
            WHERE LOWER(email) = LOWER($1)
            ORDER BY solved_at ASC
            `,
      [userEmail],
    );

    const solvedQuestions = solvedResult.rows;
    const solvedCount = solvedQuestions.length;

    // ----------------------------------------------------------
    // 5. Determine next question
    // ----------------------------------------------------------

    const nextQuestionId = solvedCount + 1;

    if (nextQuestionId > 111) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "You have already completed all 111 questions.",
      });
    }

    // ----------------------------------------------------------
    // 6. Make sure the question actually exists
    // ----------------------------------------------------------

    const questionResult = await client.query(
      `
            SELECT
                id,
                problem,
                description
            FROM questions
            WHERE id = $1
            `,
      [nextQuestionId],
    );

    if (questionResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Question not found.",
      });
    }

    // ----------------------------------------------------------
    // 7. Determine submission window
    // ----------------------------------------------------------

    let submissionStatus = "available";

    let shouldResetChallenge = false;

    if (solvedCount > 0) {
      const lastSolved = solvedQuestions[solvedQuestions.length - 1];

      const solvedAt = new Date(lastSolved.solved_at);

      // Get calendar dates in IST
      const solvedDateIST = solvedAt.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      const todayDateIST = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      // Compare calendar dates only
      const solvedDate = new Date(`${solvedDateIST}T00:00:00Z`);
      const todayDate = new Date(`${todayDateIST}T00:00:00Z`);

      const daysSinceSolved = Math.round(
        (todayDate - solvedDate) / (24 * 60 * 60 * 1000)
      );

      // Same calendar day
      if (daysSinceSolved === 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "You cannot submit the next question on the same day.",
        });
      }

      // Next calendar day
      if (daysSinceSolved === 1) {
        submissionStatus = "available";
      }

      // Second calendar day = grace + flag
      else if (daysSinceSolved === 2) {
        submissionStatus = "missed";
      }

      // Third calendar day onward = reset
      else {
        shouldResetChallenge = true;
        submissionStatus = "reset_required";
      }
    }
    let submissionQuestionId = nextQuestionId;

    if (shouldResetChallenge) {
      submissionQuestionId = 1;
    }
    // ----------------------------------------------------------
    // Reset challenge if submission window was missed
    // ----------------------------------------------------------

    if (shouldResetChallenge) {
      await client.query(
        `
    DELETE FROM solved_questions
    WHERE LOWER(email) = LOWER($1)
    `,
        [userEmail],
      );

      await client.query(
        `
    DELETE FROM submissions
    WHERE user_id = $1
    `,
        [userId],
      );
    }
    // ----------------------------------------------------------
    // 8. Check whether this question was already submitted
    // ----------------------------------------------------------

    const existingSubmission = await client.query(
      `
                SELECT id
                FROM submissions
                WHERE user_id = $1
                AND question_id = $2
                LIMIT 1
                `,
      [userId, submissionQuestionId],
    );

    if (existingSubmission.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "You have already submitted this question.",
      });
    }

    // ----------------------------------------------------------
    // 9. Check monthly flags before accepting a grace submission
    // ----------------------------------------------------------



    // ----------------------------------------------------------
    // 10. Create submission
    // ----------------------------------------------------------

    const submissionResult = await client.query(
      `
            INSERT INTO submissions (
                user_id,
                question_id,
                linkedin_url,
                github_url
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                user_id,
                question_id,
                linkedin_url,
                github_url,
                submitted_at,
                updated_at
            `,
      [
        userId,
        submissionQuestionId,
        linkedin.toString(),
        github ? github.toString() : null,
      ],
    );

    // ----------------------------------------------------------
    // 11. Add flag if this was the grace day
    // ----------------------------------------------------------

    // ----------------------------------------------------------
    // 12. Mark question as solved
    // ----------------------------------------------------------
    //
    // IMPORTANT:
    // Your current solved_questions table uses email.
    // Once we migrate it to user_id, change this accordingly.
    //

    await client.query(
      `
            INSERT INTO solved_questions (
                email,
                question_id,
                solved_at
            )
            VALUES ($1, $2, NOW())
            `,
      [userEmail, submissionQuestionId],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: shouldResetChallenge
        ? "Challenge restarted. Question 1 submitted successfully."
        : "Submission accepted.",
      submission: submissionResult.rows[0],
      questionId: submissionQuestionId,
      challengeReset: shouldResetChallenge,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Create submission error:", error);

    return res.status(500).json({
      message: error.message,
    });

  }
}

/*
|--------------------------------------------------------------------------
| GET /submissions
|--------------------------------------------------------------------------
| Returns the authenticated user's submission history.
|--------------------------------------------------------------------------
*/

export async function getMySubmissions(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
            SELECT
                s.id,
                s.question_id,
                q.problem,
                s.linkedin_url,
                s.github_url,
                s.submitted_at,
                s.updated_at
            FROM submissions s
            JOIN questions q
                ON q.id = s.question_id
            WHERE s.user_id = $1
            ORDER BY s.question_id ASC
            `,
      [userId],
    );

    return res.status(200).json({
      submissions: result.rows,
    });
  } catch (error) {
    console.error("Get submissions error:", error);

    return res.status(500).json({
      message: "Failed to load submissions.",
    });
  }
}
