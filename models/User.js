//User models
//Name, age, occupation, 
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    organization: { type: String, required: true },
    address: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    logo: String,
    qr: String,
    age: Number,
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
});

dataSchema.virtual('tasks', {
    ref: 'Client',
    localField: '_id',
    foreignField: 'owner'
})
dataSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

dataSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    //console.log(user)
    if (!user) {
        throw new Error("Unable to login");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    //console.log(ismatch)
    if (!isMatch) {
        throw new Error("Unable to login");
    }
    // console.log(user)
    return user;
}
dataSchema.pre("save", async function (next) {
    const user = this
    //console.log(user.password)
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

const User = mongoose.model("User", dataSchema);

module.exports = User;