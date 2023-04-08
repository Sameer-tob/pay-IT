const express = require("express");
const auth = require("../auth/auth");
const client = require("../utils/clients");
const router = new express.Router();

router.post("/utils/client", auth, client.findSpecificClient);
router.post("/utils/projects", auth, client.findProjectsByClient)
router.get("/utils/allTransactions", auth, client.findAllTransaction)
router.get("/utils/invoice", auth, client.findInvoices)
router.post('/utils/reports', auth, client.reports)
module.exports = router;
