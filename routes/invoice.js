const express = require("express");
const auth = require("../auth/auth");
const invoice = require("../controllers/invoice");
const router = new express.Router();

router.post("/generateInvoice", auth, invoice.generateInvoice);

module.exports = router;
