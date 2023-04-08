require("dotenv").config({ path: "../.env" })
require("../db/db");

const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { paymentDueReport } = require("../controllers/clientDueReport");
const DEFAULT_TIMEZONE = "Asia/Kolkata";


let second, minute, hour, dayOfMonth, month, dayOfWeek;

// Runs Everyday 6:01:01 AM
second = "10";
minute = "22";
hour = "14";
dayOfMonth = "*";
month = "*";
dayOfWeek = "*";

cron.schedule(
  `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`,
  () => {
    paymentDueReport()
  },
  {
    scheduled: true,
    timezone: DEFAULT_TIMEZONE,
  }
);