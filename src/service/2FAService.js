import { createJWT } from "../utils/jwtAuth.js";
import prisma from "../config/db.config.js";
import { checkTOTP, qrCodeBuilder } from "../utils/commonUtils.js";
import logger from "../config/logger.config.js";
import speakeasy from "speakeasy";
import { fetchUserRole } from "./userService.js";
import { ERROR_MESSAGES } from "../constants.js";

export const setup2FAservice = async (req, res) => {
  try {
    const user = req.user;
    var secret = speakeasy.generateSecret({ length: 20 });
    user.twoFactorSecret = secret.base32;
    user.isMFAActive = true;

    logger.info("Setting up 2FA for user: ", user.userId);

    //updating the table
    await prisma.user_auth.update({
      where: { userId: user.userId },
      data: user,
    });

    logger.info("Updated user_auth table after 2FA setup");

    //create QR code
    const qrImageURL = await qrCodeBuilder(secret, req.user.username);

    //sending back response
    res.status(200).json({ qrCode: qrImageURL, secret: secret });
  } catch (error) {
    logger.error("Error at setup2FA: " + error);
    res.status(500).json({ message: "Error at setup2FA", error: error });
  }
};

export const verify2FAService = async (req, res) => {
  try {
    const username = req.user.username;
    const userId = req.user.userId;
    console.log("userId : " + userId);
    const isVerified = checkTOTP(req);

    if (isVerified) {
      const response = await fetchUserRole(req, res);
      if (response === "error")
        return res
          .status(400)
          .json({ message: ERROR_MESSAGES.USER_ROLE_DOES_NOT_EXIST });
      // console.log("response: ", response);
      console.log("role: ", response);
      const ACCESS_TOKEN = await createJWT(username, userId, "60m");
      logger.info("Aceess Token created");
      res
        .status(200)
        .cookie("jwt", ACCESS_TOKEN, {
          //sending jwt ACCESS_TOKEN through cookie
          httpOnly: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
          secure: process.env.NODE_ENV !== "development",
        })
        .cookie("role", response, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
          secure: process.env.NODE_ENV !== "development",
        })
        .json({
          message: "2FA verified successfully",
          role: response,
        });
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    logger.error("Error at verify2FA: " + error);
    res.status(500).json({ message: "Error at verify2FA", error: error });
  }
};

export const reset2FAService = async (req, res) => {
  try {
    const user = req.user;
    user.isMFAActive = false;
    user.twoFactorSecret = ""; // Remove the 2FA secret

    //updating user_auth DB
    await prisma.user_auth.update({
      where: { userId: req.user.userId },
      data: user,
    });

    logger.info("Successfully reset 2FA for user: ", req.user.userId);

    res.status(200).json({ message: "2FA reset successfully" });
  } catch (error) {
    logger.error("Error at reset2FASetup: ", { error });
    res.status(500).json({ message: "Error at reset2FA", error: error });
  }
};
