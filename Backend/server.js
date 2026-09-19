import express from "express";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import submissionRoutes from "./routes/submissionRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes );
app.use("/submissions", submissionRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});