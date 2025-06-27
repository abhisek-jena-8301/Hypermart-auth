import jwt from "jsonwebtoken";

export const createJWT = async (username, userId, expiryTime) => {
  const payload = {
    username: username,
    userId: userId,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: expiryTime,
  });
};
