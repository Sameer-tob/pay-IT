const express = require("express");
const auth = require("../auth/auth");
const router = new express.Router();
const clientController = require("../controllers/client");
const Project = require("../models/Projects");
/*Things needed to show here
-total amount due
-total clients
-number of invoices(optional)
-total expenses
-due invoices
*/

router.get("/dashboard", auth, async (req, res) => {
    try {

        var dashboardData = {}

        const clients = await clientController.findClientsOfUser(req.user._id);

        let clientIds = []
        clients.forEach(client => {
            clientIds.push(client._id)
        })
        const projects = await Project.find({ clientId: { $in: clientIds } })

        const amountData = await Project.aggregate([
            {
                $match: {
                    clientId: { $in: clientIds },
                    paymentstatus: false,
                    invoiceGenerated: true,
                    dueDate: { $gt: new Date() }
                }
            },
            {
                $group: {
                    _id: { clientId: "$clientId" },
                    all: {
                        $push: "$$ROOT"
                    },
                    amount: { $sum: "$amount" },
                }
            },

        ])

        const amountDataPaid = await Project.aggregate([
            {
                $match: {
                    clientId: { $in: clientIds },
                    paymentstatus: true,
                    invoiceGenerated: true
                }
            },
            {
                $group: {
                    _id: { clientId: "$clientId" },
                    all: {
                        $push: "$$ROOT"
                    },
                    amount: { $sum: "$amount" },
                }
            }

        ])

        const amountDataOverdued = await Project.aggregate([
            {
                $match: {
                    clientId: { $in: clientIds },
                    paymentstatus: false,
                    invoiceGenerated: true,
                    dueDate: { $lt: new Date() }
                }
            },
            {
                $group: {
                    _id: { clientId: "$clientId" },
                    all: {
                        $push: "$$ROOT"
                    },
                    amount: { $sum: "$amount" },
                }
            },
        ]);

        const sales = await Project.aggregate([
            {
                $match: {
                    paymentstatus: true,
                    invoiceGenerated: true
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
                    amount: { $sum: "$amount" },

                }
            },

        ]);

        const projectsClientWise = await Project.aggregate([
            {
                $match: {

                }
            },
            {
                $group: {
                    _id: "$clientname",
                    all: {
                        $push: "$$ROOT"
                    }
                }

            },])


        // console.log(amountData, amountDataOverdued, amountDataPaid)
        let amountDataArray = [];
        let amountDataOverduedArray = [];
        let amountDataPaidArray = [];

        amountData.forEach((amt) =>
            amt.all.forEach(a => amountDataArray.push(a)));

        amountDataOverdued.forEach((amt) =>
            amt.all.forEach(a => amountDataOverduedArray.push(a)));
        amountDataPaid.forEach((amt) =>
            amt.all.forEach(a => amountDataPaidArray.push(a)));

        console.log(projectsClientWise)
        // projectsClientWise.forEach((project) => {
        //     console.log(project)
        // })
        var totalAmountDue = 0;
        var paidAmount = 0;
        amountDataArray.forEach(amount => {
            totalAmountDue += amount.amount;
        })
        amountDataOverduedArray.forEach(amount => {
            totalAmountDue += amount.amount;
        })

        amountDataPaidArray.forEach(amount => {
            paidAmount += amount.amount
        })

        let totalIncome = 0
        sales.forEach(s => {
            totalIncome += s.amount;
        })

        dashboardData["amountDue"] = totalAmountDue;
        dashboardData["amountDueClientWise"] = amountDataArray;
        dashboardData["amountPaidClientWise"] = amountDataPaidArray;
        dashboardData["amountOverduedClientWise"] = amountDataOverduedArray;
        dashboardData["projectNos"] = projects.length;
        dashboardData["clientNos"] = clients.length;
        dashboardData["paidAmount"] = paidAmount;
        dashboardData["incomeDayWise"] = sales
        dashboardData["totalIncome"] = totalIncome
        dashboardData["projectClientWise"] = projectsClientWise
        return res.send(dashboardData);
    }
    catch (e) {
        console.log(e)
        return res.status(400).send(e);
    }


});

module.exports = router;