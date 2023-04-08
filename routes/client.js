const express = require("express");
const auth = require("../auth/auth");
const router = new express.Router();
const User = require("../models/User");
const Client = require("../models/Clients");
const Project = require("../models/Projects");
const clientController = require("../controllers/client");

//test to be deleted later
const { paymentDueReport } = require("../controllers/clientDueReport");

//To view Clients
router.get("/client", auth, async (req, res) => {
    try {
        const client = await clientController.findClientsOfUser(req.user._id);
        return res.send(client);
    }
    catch (e) {
        return res.status(500).send();
    }

})

//To add new client
router.post("/client", auth, async (req, res) => {
    console.log(req.body)
    const client = new Client({
        ...req.body,
        owner: req.user._id
    });

    try {
        await client.save()
        console.log("saved")
        res.status(201).send({ success: true, msg: "Saved Successfully" })
    } catch (e) {
        res.status(500).send(e.message)
    }


})

//to add client project
router.post("/client/addProject", auth, async (req, res) => {
    const client = await Client.findOne({ name: req.body.clientname });
    console.log(req.body);
    let data = {
        clientId: client._id,
        clientname: req.body.clientname,
        email: client.email,
        projectname: req.body.projectname,
    }

    //amount and due date need to be added in invoice section
    try {
        const project = new Project(data);
        await project.save();

        return res.send({ success: true, msg: "Project Saved Successfully" });
    }
    catch (e) {
        console.log(e)
    }
})


//test to be deleted later
router.get('/client/duedate', async (req, res) => {
    paymentDueReport()
})


module.exports = router;