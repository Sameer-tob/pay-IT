const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://sameer_kumar:sameer-mongodb@cluster1.nn9p7d4.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connected Successfully 🎇")
}).catch(() => {
    console.log("DB failed to connect");
});

