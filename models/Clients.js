const mongoose = require("mongoose");
const dataSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name: { type: String, unique: true },
        address: String,
        phone: { type: String },
        email: {
            type: String,
            unique: true,
            required: true
        }


    });
const clientDetails = mongoose.model("Client", dataSchema);
module.exports = clientDetails;