import express, { urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import dbConnection from "./config/mongo.db.connection.js";
import "../src/config/passport.config.js";
import authRoutes from "./controller/auth.controller.js";

dotenv.config();
// dbConnection(); // Connect to MongoDB

const app = express();
const corsOptions = {
  origin: ["http://localhost:3001"],
  credentials: true,
};

//Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(urlencoded({ extended: true, limit: "100mb" }));
app.use(
  session({
    secret: process.env.SESSION_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 1000, // 60 minutes
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/auth", authRoutes);

//Listener
const PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
