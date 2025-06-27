import { Router } from "express";
import passport from "passport";
import {
  statusCheckApi,
  loginUser,
  checkAuthStatus,
  logoutUser,
  changePassword,
} from "../service/userService.js";
import {
  setup2FAservice,
  verify2FAService,
  reset2FAService,
} from "../service/2FAService.js";
import authentication2FACheck from "../middleware/2FASetup.middleware.js";

const router = Router();

//TestApi route
router.get("/test", statusCheckApi);

//Login route
router.post("/login", passport.authenticate("local"), loginUser);
//Auth Status Route
router.get("/status", checkAuthStatus);
//Logout route
router.post("/logout", logoutUser);
//changePassword route
router.put("/changePassword", changePassword);

//2FA setup
router.post("/2fa/setup", authentication2FACheck, setup2FAservice);

//2FA verify
router.post("/2fa/verify", authentication2FACheck, verify2FAService);

//2FA reset
router.post("/2fa/reset", authentication2FACheck, reset2FAService);

export default router;
