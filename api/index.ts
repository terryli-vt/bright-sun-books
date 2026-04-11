import express from "express";
import app from "../server/src/app";

// Vercel serverless entry point.
// Mounts the Express app under /api so that:
//   /api/books  →  /books  inside the existing router
//   /api/auth/* →  /auth/* inside the existing router
const serverless = express();
serverless.use("/api", app);

export default serverless;
