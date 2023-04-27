const moment = require('moment-timezone');
const express = require('express');
const router = express.Router();
const logger = require('../routes/logger.js');
const kleur = require('kleur');
const LastResetTimestamp = require('../models/LastResetTimestamp');

const resetBreakTimeRoutes = (User, io, location) => {
  const router = express.Router();
  const resetHour = 22;

  async function getMillisecondsUntilReset() {
    let lastResetTimestampObj = await LastResetTimestamp.findOne();
    if (!lastResetTimestampObj) {
      lastResetTimestampObj = new LastResetTimestamp({ timestamp: new Date() });
      await lastResetTimestampObj.save();
    }
    const lastResetTimestamp = lastResetTimestampObj.timestamp;
    const now = moment.tz(new Date(), 'Europe/' + location);
    const lastResetTime = moment.tz(new Date(lastResetTimestamp), 'Europe/' + location);
    lastResetTime.set({hour: resetHour, minute: 0, second: 0, millisecond: 0});

    while (now.isAfter(lastResetTime)) {
      lastResetTime.add(1, 'days');
    }

    const millisecondsUntilReset = lastResetTime.diff(now);
    return millisecondsUntilReset;
  }
 
  async function resetBreakTimes() {
    const now = moment.tz(new Date(), 'Europe/' + location).toDate();
    if (now.getHours() >= resetHour) {
      const resetBreakTimeInSeconds = 35 * 60;
      await User.updateMany({}, { remainingBreakTime: resetBreakTimeInSeconds });
      const lastResetTimestampObj = await LastResetTimestamp.findOne();
      lastResetTimestampObj.timestamp = now;
      await lastResetTimestampObj.save();
      logger.info(`${kleur.blue("Total break time for all accounts has been reset")}`);
      io.emit('reload');
    }
  }

  (async () => {
    const millisecondsUntilReset = await getMillisecondsUntilReset();
    setTimeout(() => {
      resetBreakTimes();
      setInterval(resetBreakTimes, 24 * 60 * 60 * 1000);
    }, millisecondsUntilReset);
  })();

  router.post("/", async (req, res, next) => {
    await resetBreakTimes();
    io.emit('reload');
    res.sendStatus(200);
  });

  return router;
};

module.exports = resetBreakTimeRoutes;
