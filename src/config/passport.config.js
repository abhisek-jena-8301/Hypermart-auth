/**
 * passport config file
 */
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import prisma from "./db.config.js";
import logger from "./logger.config.js";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("Passport local strategy configured");

      const user = await prisma.user_auth.findUnique({
        where: { username: username },
      });

      if (!user) {
        return done(null, false, { message: "Invalid username" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) return done(null, user);
      else {
        return done(null, false, { message: "Invalid password" });
      }
    } catch (error) {
      console.log("Error at passport local strategy: " + error);
      return done(error, false, {
        message: "Error at passport local strategy",
      });
    }
  })
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  logger.info("Serializing user: " + user.userId);
  done(null, user.userId); // Store the user ID in the session
});

// Deserialize user from the session
passport.deserializeUser(async (userId, done) => {
  try {
    const user = await prisma.user_auth.findUnique({
      where: { userId: userId }, // Query user by ID from PostgreSQL
    });
    logger.info("Deserializing user:" + JSON.stringify(user));
    done(null, user);
  } catch (error) {
    logger;
    done(error, null);
  }
});
