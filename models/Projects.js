const mongoose = require("mongoose");
const dataSchema = new mongoose.Schema(
    {
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Client'
        },
        clientname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        projectname: {
            type: String,
            required: true
        },
        invoice: { type: String },
        amount: { type: Number },
        invoiceGenerated: { type: Boolean, default: false },
        paymentstatus: {
            type: Boolean,
            default: false,
            required: true
        },
        dueDate: {
            type: Date,
        },
        paymentLink: String,
        paymentLinkId: String,
        paymentDate: Date
    });
const projectDetails = mongoose.model("Projects", dataSchema);
module.exports = projectDetails;