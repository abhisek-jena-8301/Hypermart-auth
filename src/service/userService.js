import logger from "../config/logger.config.js";
import prisma from "../config/db.config.js";
import bcrypt from "bcryptjs";
import { validatePassword } from "../utils/commonUtils.js";
import { ERROR_MESSAGES } from "../constants.js";

export const statusCheckApi = (req, res) => {
  try {
    return res.status(200).json({ message: "API is working" });
  } catch (error) {
    logger.error("Error at statusCheckApi: " + JSON.stringify(error));
    return res.status(500).json({ message: "Error at testApi", error: error });
  }
};

export const loginUser = async (req, res) => {
  logger.info("The authenticated user is: " + req.user.username);
  res.status(200).json({
    message: "User logged in successfully",
    username: req.user.username,
    isMFAActive: req.user.isMFAActive,
  });
};

export const checkAuthStatus = async (req, res) => {
  try {
    if (req.user) {
      return res.status(200).json({
        loggedIn: true,
        user: req.user.username,
        isMFAActive: req.user.isMFAActive,
      });
    } else {
      logger.error("Error at checkAuthStatus: user not found");
      return res
        .status(401)
        .json({ loggedIn: false, message: "User not authorized" });
    }
  } catch (error) {
    logger.error("Error at checkAuhStatus : " + error);
    return res
      .status(400)
      .json({ message: "Error at checkAuthStatus", error: error });
  }
};

export const logoutUser = async (req, res) => {
  if (!req.user)
    return res.status(401).json({ message: "User not authorized" });
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) return next(err);

      res.clearCookie("connect.sid");
      res.clearCookie("jwt");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
};

export const changePassword = async (req, res) => {
  try {
    logger.debug("Inside changePassword for :" + req.body.username);
    const { username, password } = req.body;
    //validating request payload
    if (!username || !password) {
      return res.status(400).json({ message: ERROR_MESSAGES.INAVLID_DATA });
    }
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.PASSWORD_CRITERIA_NOT_MET });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    //updating the user_auth table
    await prisma.user_auth.update({
      where: { username },
      data: { password: hashedPassword },
    });

    logger.info("Upadted password in user_auth");
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error("Error at changePassword : " + error);
    if (error.code === "P2025") {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.USER_DOES_NOT_EXIST });
    }
    return res
      .status(500)
      .json({ message: "Error at changePassword", error: error });
  }
};

export const fetchUserRole = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: ERROR_MESSAGES.INVALID_REQUEST });
    } else {
      const username = req.user.username;
      console.log("username: ", username);
      const userRole = await prisma.user_auth.findUnique({
        where: { username: username },
        select: {
          role: true,
        },
      });
      logger.info("Fetched userRole for user: " + username);
      return userRole.role;
    }
  } catch (error) {
    logger.error("Error at fetch user role : " + error);
    return "error";
  }
};
