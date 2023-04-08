const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = async (req, res, next) => {
    try {
        console.log(req.header("Authorization"));
        const token = req.header("Authorization").replace("Bearer ", "")
        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({ _id: decoded._id, "tokens.token": token })
        if (!user) {
            throw Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ "error": "Please Authenticate." })
    }
}

module.exports = auth