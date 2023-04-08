require("dotenv").config()
require("./db/db");
const cors = require("cors")
const userRoutes = require("./routes/user");
const clientRoutes = require("./routes/client");
const dashboardRoutes = require("./routes/dashboard");
const invoiceRoutes = require("./routes/invoice");
const utilsRoutes = require('./routes/utils');
const express = require("express");
const app = express();

app.use(express.json());

const whitelist = ["http://localhost:3000"]
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
}
app.use(cors(corsOptions))

app.use(userRoutes);
app.use(clientRoutes);
app.use(dashboardRoutes);
app.use(invoiceRoutes);
app.use(utilsRoutes);

app.listen(2000, () => {
    console.log("App Running🚀");
})



/* Idea for expense tracking
will use a cron job to parse owner email and remind the owner for his due payments


there need to be two seperate pages for add client and add project since database is different

Deleting one client should also delete all the projects of the client

use .populate().execpopulate to access relational collections
*/