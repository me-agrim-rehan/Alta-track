import pool from "../db.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
export async function register(req, res) {
  try {
    const { name, email, phone, password, campus, year, program } = req.body;

    // 1. Required fields
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !campus ||
      !year ||
      !program
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2. Clean input
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanCampus = campus.trim();
    const cleanProgram = program.trim();

    // 3. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    // 4. Validate Indian phone number
    const phoneRegex = /^[6-9][0-9]{9}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        message: "Invalid Indian phone number",
      });
    }

    // 5. Validate password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character with no spaces",
      });
    }

    // 6. Validate campus
    const allowedCampuses = [
      "ADYPU Pune",
      "SAGE University Indore",
      "IITM Delhi NCR",
      "Vivekananda Global University Jaipur",
      "DRK Institute Hyderabad",
    ];

    if (!allowedCampuses.includes(cleanCampus)) {
      return res.status(400).json({
        message: "Invalid campus",
      });
    }

    // 7. Validate program
    const allowedPrograms = ["ALTA_FOUNDATION_111", "ALTA_APEX"];

    if (!allowedPrograms.includes(cleanProgram)) {
      return res.status(400).json({
        message: "Invalid program",
      });
    }

    // 8. Validate year
    const parsedYear = Number(year);

    if (!Number.isInteger(parsedYear) || parsedYear < 1 || parsedYear > 4) {
      return res.status(400).json({
        message: "Year must be between 1 and 4",
      });
    }

    // 9. Validate program + year
    if (cleanProgram === "ALTA_FOUNDATION_111" && parsedYear !== 1) {
      return res.status(400).json({
        message: "ALTA Foundation 111 is only available for Year 1",
      });
    }

    if (cleanProgram === "ALTA_APEX" && parsedYear < 2) {
      return res.status(400).json({
        message: "ALTA Apex is only available for Year 2, Year 3 or Year 4",
      });
    }

    // 10. Check email
    const existingEmail = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
      [cleanEmail],
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // 11. Check phone
    const existingPhone = await pool.query(
      `SELECT id FROM users WHERE phone = $1`,
      [cleanPhone],
    );

    if (existingPhone.rows.length > 0) {
      return res.status(409).json({
        message: "Phone number already registered",
      });
    }

    // 12. Hash password
    const passwordHash = await argon2.hash(password);

    // 13. Create user
    const result = await pool.query(
      `
      INSERT INTO users
        (
          name,
          email,
          phone,
          password_hash,
          campus,
          year,
          program
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        name,
        email,
        phone,
        campus,
        year,
        program,
        created_at
      `,
      [
        cleanName,
        cleanEmail,
        cleanPhone,
        passwordHash,
        cleanCampus,
        parsedYear,
        cleanProgram,
      ],
    );

    return res.status(201).json({
      message: "Registration successful",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Find user by email
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        password_hash,
        campus,
        year,
        program
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [cleanEmail],
    );
    // 3. User not found
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // 4. Verify password
    const validPassword = await argon2.verify(user.password_hash, password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 5. Create authentication token
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // 6. Remove password hash
    delete user.password_hash;

    // 7. Set HTTP-only cookie
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none" ,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // 8. Login successful
    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function checkEmail(req, res) {
  try {
    const email = req.query.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
      [email],
    );

    return res.status(200).json({
      exists: result.rows.length > 0,
    });
  } catch (error) {
    console.error("Check email error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function checkPhone(req, res) {
  try {
    const phone = req.query.phone?.trim();

    if (!phone) {
      return res.status(400).json({
        message: "Phone is required",
      });
    }

    const result = await pool.query(`SELECT id FROM users WHERE phone = $1`, [
      phone,
    ]);

    return res.status(200).json({
      exists: result.rows.length > 0,
    });
  } catch (error) {
    console.error("Check phone error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function logout(req, res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    message: "Logout successful",
  });
}
export async function getCurrentUser(req, res) {
  return res.status(200).json({
    authenticated: true,
    user: req.user,
  });
}
