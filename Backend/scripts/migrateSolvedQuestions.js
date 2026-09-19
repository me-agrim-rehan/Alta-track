import fs from "fs";
import csv from "csv-parser";
import pool from "../db.js";

const filePath =
  "../main.csv";

async function migrateSolvedQuestions() {
  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csv({ headers: false }))
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", async () => {
      try {
        let totalInserted = 0;

        // First row is the header
        rows.shift();

        for (const row of rows) {
          const email = String(row[2] || "").trim();

          if (!email) {
            console.log("Skipping row without email");
            continue;
          }

          let solvedCount = 0;

          // Questions 1 → 111
          for (let questionId = 1; questionId <= 111; questionId++) {
            // Email is index 2
            // Question 1 is index 3
            // Question 2 is index 4
            // etc.
            const columnIndex = questionId + 2;

            const value = String(row[columnIndex] || "")
              .trim()
              .toUpperCase();

            if (value === "TRUE") {
              const result = await pool.query(
                `
                INSERT INTO solved_questions
                    (email, question_id)
                VALUES
                    ($1, $2)
                ON CONFLICT (email, question_id)
                DO NOTHING
                `,
                [email, questionId]
              );

              if (result.rowCount > 0) {
                totalInserted++;
                solvedCount++;
              }
            }
          }

          console.log(
            `${email} → ${solvedCount} questions imported`
          );
        }

        console.log("--------------------------------");
        console.log("Migration complete.");
        console.log(`Total new records inserted: ${totalInserted}`);

        await pool.end();
      } catch (error) {
        console.error("Migration failed:", error);
        await pool.end();
        process.exit(1);
      }
    });
}

migrateSolvedQuestions();