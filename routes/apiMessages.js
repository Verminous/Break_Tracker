'use strict';

const responseMap = {
  // LOGIN
  "true": { status: 200, message: "Login successful" },
  "false": { status: 401, message: "Wrong credentials" },
  "error1": { status: 401, message: "Error1" },
  "error2": { status: 401, message: "Error2" },
  "errorx": { status: 401, message: "Errorx" },
  // USER REGISTRATION
  "Taken": { status: 401, message: "Username taken" },
  "Error": { status: 500, message: "Error! Try again" },
  "NoUser": { status: 500, message: "No username given" },
  "NoPass": { status: 500, message: "No password given" },
  "Mismatch": { status: 500, message: "Passwords don't match" },
  "Ok": { status: 200, message: "Account registered" },
  // PASSWORD
  "Current password empty": { status: 401, message: "Current password empty" },
  "Current password wrong": { status: 401, message: "Current password wrong" },
  "New password empty": { status: 401, message: "New password empty" },
  "Confirm password empty": { status: 401, message: "Confirm password empty" },
  "Changed": { status: 200, message: "Password changed" },
  // ACCOUNT MANAGEMENT
  "Deleted": { status: 200, message: "Account deleted" },
  "Role changed": { status: 200, message: "Role was changed" },
  "Time changed": { status: 200, message: "Total break time changed" },
  "Name changed": { status: 200, message: "Username changed" },
  // BREAKS
  "Only 1 break at a time": { status: 401, message: "Only 1 break" + `<br>` + "at a time" },
  "Break time over": { status: 401, message: "No minutes available" },
  "Not enough": { status: 401, message: "Not enough minutes available" },
  "Break submitted": { status: 200, message: "Break submitted" },
  "Break started": { status: 200, message: "Break started. Enjoy!" },
  "Added to queue": { status: 200, message: "Break added" + `<br>` + "to queue" },
  "Breaks reset" : { status: 200, message: "Break time" + `<br>` + " has been reset!" },
  // SLOTS AVAILABLE
  "Same value": { status: 401, message: "Same value!" },
  "Updated": { status: 200, message: "Slots updated" },
  // GENERAL ERROR
  "Something broke" : { status: 401, message: "Something broke!" }
};

const myMessages = async (req, res, next) => {
  const sessionKeys = ["loggedIn", "newAccount", "passChange", "roleChange", "message", "slotsAvailable"];
  for (const key of sessionKeys) {
    const sessionValue = req.session[key];
    if (responseMap.hasOwnProperty(sessionValue)) {
      const { status, message } = responseMap[sessionValue];
      return res.status(status).json({ message });
    }
  }
}

export default myMessages;