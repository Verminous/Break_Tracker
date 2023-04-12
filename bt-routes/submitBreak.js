const express = require('express');
const router = express.Router();
const logger = require('../serverjs/logger.js');
const kleur = require('kleur');

// Import the BreakTrack model
const BreakTrack = require('../models/BreakTrack.js');
const BreakSlots = require('../models/BreakSlots.js');

const moveToNormalList = async (BreakTrack) => {
  const availableSlotsData = await BreakSlots.findOne();
  const availableSlots = availableSlotsData.slots;
  const activeBreaks = await BreakTrack.countDocuments({ status: 'active' });

  if (activeBreaks < availableSlots) {
    const nextInQueue = await BreakTrack.findOne({ status: 'queued' }).sort({ date: 1 });

    if (nextInQueue) {
      nextInQueue.status = 'active';
      await nextInQueue.save();
    }
  }
};

const submitBreaks = (io, BreakTrack, User) => {
  router.post("/", async function (req, res, next) {
    const user = req.user.username;
    const latestBreak = await BreakTrack.findOne({ user }).sort({ startTime: -1 });
    const breakDuration = req.body.duration;
    const currentUser = await User.findOne({ username: user });
    const breakDurationInSeconds = breakDuration * 60;

    if (latestBreak && !latestBreak.endTime) {
      req.session.message = 'Only 1 break at a time';
      logger.info(req.session.message);
      return res.redirect("/secret");
    } else if (currentUser.remainingBreakTime < breakDurationInSeconds) {
      if (currentUser.remainingBreakTime === 0) {
        req.session.message = 'Break time over';
      } else {
        req.session.message = 'Not enough';
      }
      logger.info(req.session.message);
      return res.redirect("/secret");
    } else {
      // Check if there are available slots
      const availableSlots = (await BreakSlots.findOne()).slots;
      const activeBreaks = await BreakTrack.countDocuments({ status: 'active' });

      if (activeBreaks < availableSlots) {
        const breakTracker = new BreakTrack({
          user,
          startTime: new Date().toUTCString(),
          duration: breakDuration,
          date: new Date().toUTCString(),
          status: 'active'
        });
        try {
          await breakTracker.save();
          req.session.message = 'Break submitted';
          logger.info(`${kleur.magenta(user)} submitted a break of ${breakDuration} minute(s)`);

          // Update the user's remaining break time
          currentUser.remainingBreakTime -= breakDurationInSeconds;
          await currentUser.save(); // Save the updated remaining break time

          await moveToNormalList(BreakTrack);

          io.emit('reload');
          return res.redirect("/secret");
        } catch (err) {
          return res.redirect("/secret");
        }
      } else {
        const breakTracker = new BreakTrack({
          user,
          startTime: new Date().toUTCString(),
          duration: breakDuration,
          date: new Date().toUTCString(),
          status: 'queued'
        });
        try {
          await breakTracker.save();
          req.session.message = 'Break submitted and added to the queue';
          logger.info(`${kleur.magenta(user)} submitted a break of ${breakDuration} minute(s) and added to the queue`);

          // Update the user's remaining break time
          currentUser.remainingBreakTime -= breakDurationInSeconds;
          await currentUser.save(); // Save the updated remaining break time

          await moveToNormalList(BreakTrack);

          io.emit('reload');
          return res.redirect("/secret");
        } catch (err) {
          return res.redirect("/secret");
        }
      }
    }
  });
  return router;
}

module.exports = { submitBreaks, moveToNormalList };
