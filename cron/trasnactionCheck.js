require("dotenv").config({ path: "../.env" })
require("../db/db");

const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { updateDB } = require("../controllers/checkTransactions");
const { paymentDueReport } = require("../controllers/clientDueReport");
const DEFAULT_TIMEZONE = "Asia/Kolkata";


let second, minute, hour, dayOfMonth, month, dayOfWeek;

// Runs Everyday 6:01:01 AM
// second = "45";
// minute = "55";
// hour = "*";
// dayOfMonth = "*";
// month = "*";
// dayOfWeek = "*";

cron.schedule(
    "*/10 * * * * *",
    () => {
        console.log("yes")
        updateDB()
    },
    {
        scheduled: true,
        timezone: DEFAULT_TIMEZONE,
    }
);


