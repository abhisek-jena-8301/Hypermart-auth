import speakeasy from "speakeasy";
import qrCode from "qrcode";
import { PASSWORD_REGEX } from "../constants.js";

//qrCodeBuilder
export const qrCodeBuilder = async (secret, label) => {
  const url = speakeasy.otpauthURL({
    secret: secret.base32,
    label: `${label}`,
    issuer: "HyperMart-auth",
    encoding: "base32",
  });
  const qrImageURL = await qrCode.toDataURL(url);
  return qrImageURL;
};

//verify time based otp
export const checkTOTP = async (req) => {
  const user = req.user;
  const otp = req.body.otp;
  const isVerified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
  });
  return isVerified;
};

//validate password
export const validatePassword = (password) => {
  return PASSWORD_REGEX.test(password);
};
