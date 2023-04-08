const Project = require("../models/Projects");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const updateDB = async () => {
    const stripe = require('stripe')('sk_test_51MqYGhSD300aqpgJpHESHiPg5oV1XAZ7rGKuBeJAMT3VKmYWMtxOji83CeH44qONCQ8yHaW488BPveHI3kuIoW8p00l3WGC8gi');
    const events = await stripe.events.list({
        limit: 10, type: "charge.succeeded"
    });
    // console.log(events.data[0].data.object.billing_details)
    // console.log(events)
    events.data.forEach(async (eve) => {
        console.log(eve);
        await Project.findOneAndUpdate({ email: eve.data.object.billing_details.email, amount: parseInt(eve.data.object.amount / 100), paymentstatus: false }, { paymentstatus: true, paymentDate: new Date().toISOString() })
    }
    );

}

//find paid clients, not-paid clients;



module.exports = { updateDB };