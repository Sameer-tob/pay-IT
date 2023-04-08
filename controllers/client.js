const User = require("../models/User");
const Client = require("../models/Clients");

const findClientsOfUser = async (id) => {
    try {
        const clients = await Client.find({ owner: id });
        return clients;
    }
    catch (e) {
        throw new Error();
    }

}

//find paid clients, not-paid clients;



module.exports = { findClientsOfUser };