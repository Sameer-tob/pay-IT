const User = require("../models/User");
const Client = require("../models/Clients");
const projectDetails = require("../models/Projects");
const moment = require('moment')
const findSpecificClient = async (req, res) => {
    console.log(req.body);
    try {
        const client = await Client.findOne({ name: req.body.clientname });
        return res.send(client)
    }
    catch (e) {
        return res.status(400).send()
    }
}

const findProjectsByClient = async (req, res) => {
    const projects = await projectDetails.find({ clientname: req.body.clientname })
    return res.send(projects)
}

const findAllTransaction = async (req, res) => {
    const projects = await projectDetails.find({ invoiceGenerated: true })
    return res.send(projects)
}


const findInvoices = async (req, res) => {
    const invoices = await projectDetails.find({ invoiceGenerated: true })
    res.send(invoices)
}

const reports = async (req, res) => {
    console.log(req.body)
    const projects = await projectDetails.find({ dueDate: { $gte: moment(req.body.startDate).toISOString(), $lte: moment(req.body.endDate).toISOString() } });
    res.send(projects)
}
//find paid clients, not-paid clients;



module.exports = { findSpecificClient, findProjectsByClient, findInvoices, findAllTransaction, reports };