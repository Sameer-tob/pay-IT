const express = require("express");
const auth = require("../auth/auth");
const router = new express.Router();
const User = require("../models/User");

//////// Authentication routes/////////////////////

router.post("/user", async (req, res) => {
    const user = new User(req.body);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token })
})
router.get("/user", auth, async (req, res) => {
    const user = await User.findById(req.user._id)
    console.log(user);
})


router.post("/user/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        if (e.message == "Unable to login") {
            return res.status(401).send(e.message);
        }
        return res.status(400).send();

    }
})

router.post("/user/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
/////////////////////////////////////////////////////


///////


module.exports = router;