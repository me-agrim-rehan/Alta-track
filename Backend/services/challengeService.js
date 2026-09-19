import pool from "../db.js";

function calculateCurrentStreak(solvedQuestions) {
  if (solvedQuestions.length === 0) {
    return 0;
  }

  let streak = 1;

  for (let i = solvedQuestions.length - 1; i > 0; i--) {
    const current = new Date(solvedQuestions[i].solved_at);
    const previous = new Date(solvedQuestions[i - 1].solved_at);

    const currentDate = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate()
    );

    const previousDate = new Date(
      previous.getFullYear(),
      previous.getMonth(),
      previous.getDate()
    );

    const daysBetween =
      (currentDate - previousDate) /
      (24 * 60 * 60 * 1000);

    if (daysBetween === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function getChallengeState(userId, userEmail) {
  // 1. Get solved questions
  const solvedResult = await pool.query(
    `
    SELECT question_id, solved_at
    FROM solved_questions
    WHERE LOWER(email) = LOWER($1)
    ORDER BY solved_at ASC
    `,
    [userEmail],
  );

  const solvedQuestions = solvedResult.rows;
  const solvedCount = solvedQuestions.length;
  const currentStreak = calculateCurrentStreak(solvedQuestions);

  // Challenge hasn't started
  if (solvedCount === 0) {
    return {
      currentQuestion: 1,
      solved: 0,
      streak: 0,
      monthlyFlags: await getMonthlyFlags(userId),
      status: "not_started",
      canSubmit: true,
      challengeReset: false,
    };
  }

  // 2. Last solved question
  const lastSolved = solvedQuestions[solvedQuestions.length - 1];

  const solvedAt = new Date(lastSolved.solved_at);
  const now = new Date();

  const solvedDate = new Date(
    solvedAt.getFullYear(),
    solvedAt.getMonth(),
    solvedAt.getDate(),
  );

  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  const daysSinceSolved = Math.floor(
    (todayDate - solvedDate) / millisecondsPerDay,
  );

  const monthlyFlags = await getMonthlyFlags(userId);

  // -----------------------------
  // SAME DAY
  // -----------------------------

  if (daysSinceSolved === 0) {
    return {
      currentQuestion: solvedCount + 1,
      solved: solvedCount,
      streak: currentStreak,
      monthlyFlags,
      status: "completed_today",
      canSubmit: false,
      challengeReset: false,
    };
  }

  // -----------------------------
  // NEXT DAY
  // -----------------------------

  if (daysSinceSolved === 1) {
    return {
      currentQuestion: solvedCount + 1,
      solved: solvedCount,
      streak: currentStreak,
      monthlyFlags,
      status: "active",
      canSubmit: true,
      challengeReset: false,
    };
  }

  // -----------------------------
  // MISSED ONE DAY
  // -----------------------------

  if (daysSinceSolved === 2) {
    return {
      currentQuestion: solvedCount + 1,
      solved: solvedCount,
      streak: 0,
      monthlyFlags,
      status: "missed",
      canSubmit: true,
      challengeReset: false,
    };
  }

  // -----------------------------
  // MISSED TWO+ DAYS
  // -----------------------------

  return {
    currentQuestion: 1,
    solved: 0,
    streak: 0,
    monthlyFlags,
    status: "reset_required",
    canSubmit: true,
    challengeReset: true,
  };
}

// ========================================
// MONTHLY FLAGS
// ========================================

export async function getMonthlyFlags(userId) {
  const result = await pool.query(
    `
    SELECT COUNT(*)::INTEGER AS flag_count
    FROM challenge_flags
    WHERE user_id = $1
      AND flagged_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND flagged_at <
          DATE_TRUNC('month', CURRENT_DATE)
          + INTERVAL '1 month'
    `,
    [userId],
  );

  return result.rows[0].flag_count;
}

export async function processMissedDay(userId, userEmail) {
  const solvedResult = await pool.query(
    `
    SELECT question_id, solved_at
    FROM solved_questions
    WHERE LOWER(email) = LOWER($1)
    ORDER BY solved_at ASC
    `,
    [userEmail],
  );

  const solvedQuestions = solvedResult.rows;

  // Challenge hasn't started
  if (solvedQuestions.length === 0) {
    return {
      flagAdded: false,
      challengeReset: false,
    };
  }

  const lastSolved = solvedQuestions[solvedQuestions.length - 1];

  const solvedAt = new Date(lastSolved.solved_at);
  const now = new Date();

  const solvedDate = new Date(
    solvedAt.getFullYear(),
    solvedAt.getMonth(),
    solvedAt.getDate(),
  );

  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const daysSinceSolved = Math.floor(
    (todayDate - solvedDate) / (24 * 60 * 60 * 1000),
  );

  const nextQuestionId = solvedQuestions.length + 1;

  // ----------------------------------------
  // No missed day
  // ----------------------------------------

  if (daysSinceSolved <= 1) {
    return {
      flagAdded: false,
      challengeReset: false,
    };
  }

  // ----------------------------------------
  // Missed exactly ONE day
  // ----------------------------------------

  if (daysSinceSolved === 2) {
    const flagResult = await pool.query(
      `
      INSERT INTO challenge_flags (
        user_id,
        question_id
      )
      VALUES ($1, $2)
      ON CONFLICT (user_id, question_id)
      DO NOTHING
      RETURNING id
      `,
      [userId, nextQuestionId],
    );

    return {
      flagAdded: flagResult.rows.length > 0,
      challengeReset: false,
    };
  }

  // ----------------------------------------
  // Missed TWO OR MORE days
  // ----------------------------------------

  if (daysSinceSolved >= 3) {
    await pool.query(
      `
      DELETE FROM solved_questions
      WHERE LOWER(email) = LOWER($1)
      `,
      [userEmail],
    );

    await pool.query(
      `
      DELETE FROM submissions
      WHERE user_id = $1
      `,
      [userId],
    );

    return {
      flagAdded: false,
      challengeReset: true,
    };
  }

  return {
    flagAdded: false,
    challengeReset: false,
  };
}
