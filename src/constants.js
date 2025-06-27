export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,}$/;

export const ERROR_MESSAGES = {
  INAVLID_DATA: "Invalid Data",
  USER_DOES_NOT_EXIST: "UserId does not exist",
  INVALID_REQUEST: "Invalid Request",
  USER_ROLE_DOES_NOT_EXIST: "Not able to find user role code",
  PASSWORD_CRITERIA_NOT_MET: "Password criteria not met, Please try again",
};
