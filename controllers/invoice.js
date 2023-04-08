const easyinvoice = require("easyinvoice");
const fs = require('fs');
const AWS = require('aws-sdk')
const Project = require("../models/Projects");
const User = require("../models/User");
const moment = require("moment")
const stripe = require('stripe')("sk_test_51MqYGhSD300aqpgJpHESHiPg5oV1XAZ7rGKuBeJAMT3VKmYWMtxOji83CeH44qONCQ8yHaW488BPveHI3kuIoW8p00l3WGC8gi");


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const generateInvoice = async (req, res) => {
    const dueDate = moment(req.body.dueDate, "MM/DD/YYYY").toISOString()
    // const dueDateFormatted = moment(req.body.dueDate).format("DD-MM-YYYY")
    console.log(req.body)
    const client = await User.findOne({ clientname: req.body.clientname })

    const items = req.body.items;
    let amount = 0;
    let itemsList = []
    for (i = 0; i < items.length; i++) {
        itemsList.push({ quantity: 1, description: items[i].name, "tax-rate": 5, price: items[i].amount })
        amount += parseInt(items[i].amount);
    }
    console.log(itemsList)
    var data = {
        // Customize enables you to provide your own templates
        // Please review the documentation for instructions and examples
        "customize": {
            //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
        },
        "images": {
            // The logo on top of your invoice
            "logo": "https://w7.pngwing.com/pngs/403/269/png-transparent-react-react-native-logos-brands-in-colors-icon-thumbnail.png",
            // The invoice background
            //"background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
        },
        // Your own data
        "sender": {
            "name": req.user.name,
            "company": req.user.organization,
            "address": req.user.address,
            "zip": req.user.zip,
            "city": req.user.city,
            "country": req.user.country
            //"custom1": "custom value 1",
            //"custom2": "custom value 2",
            //"custom3": "custom value 3"
        },
        // Your recipient
        "client": {
            "company": client.name,
            "address": client.address,
            "phone": client.phone,
            "email": client.email,
            // "custom1": "custom value 1",
            // "custom2": "custom value 2",
            // "custom3": "custom value 3"
        },
        "information": {
            // Invoice number
            "number": "2021.0001",
            // Invoice data
            "date": "12-12-2021",
            // Invoice due date
            "due-date": dueDate
        },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically 
        "products": itemsList,
        // The message you would like to display on the bottom of your invoice
        "bottom-notice": "Kindly pay your invoice within the next 15 days.",
        // Settings to customize your invoice
        "settings": {
            "currency": "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
            // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
            "tax-notation": "GST", // Defaults to 'vat'
            // "margin-top": 25, // Defaults to '25'
            // "margin-right": 25, // Defaults to '25'
            // "margin-left": 25, // Defaults to '25'
            // "margin-bottom": 25, // Defaults to '25'
            // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
            // "height": "1000px", // allowed units: mm, cm, in, px
            // "width": "500px", // allowed units: mm, cm, in, px
            // "orientation": "landscape", // portrait or landscape, defaults to portrait
        },
        // Translate your invoice to your preferred language
        "translate": {
            // "invoice": "FACTUUR",  // Default to 'INVOICE'
            // "number": "Nummer", // Defaults to 'Number'
            // "date": "Datum", // Default to 'Date'
            // "due-date": "Verloopdatum", // Defaults to 'Due Date'
            // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
            // "products": "Producten", // Defaults to 'Products'
            // "quantity": "Aantal", // Default to 'Quantity'
            // "price": "Prijs", // Defaults to 'Price'
            // "product-total": "Totaal", // Defaults to 'Total'
            // "total": "Totaal" // Defaults to 'Total'
        },
    };

    //Create your invoice! Easy!
    easyinvoice.createInvoice(data, async function (result) {
        //The response will contain a base64 encoded PDF file

        const filepath = `./controllers/${req.body.clientname}_${req.body.projectname}.pdf`


        await fs.writeFileSync(filepath, result.pdf, "base64");
        const fileContent = fs.readFileSync(filepath)

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${req.body.clientname}_${req.body.projectname}.pdf`,
            Body: fileContent
        }
        var location_url
        s3.upload(params, async (err, data) => {
            if (err) {
                console.log(err);
            }
            console.log(data.Location);
            location_url = data.Location
            const update = { invoice: data.Location, invoiceGenerated: true, dueDate: dueDate, amount: amount };
            const project = await Project.findOneAndUpdate({ clientname: req.body.clientname, projectname: req.body.projectname }, update);
        });
        await fs.unlinkSync(filepath);
        // const project = await Project.findOne({ clientname: req.body.clientname, projectname: req.body.projectname })
        // const customer = await stripe.customers.create({
        //     description: req.body.clientname + "~" + req.body.projectname,
        //     metadata: {
        //         clientname: req.body.clientname,
        //         projectname: req.body.projectname
        //     }
        // });
        const product = await stripe.products.create({
            name: req.body.projectname,
            metadata: {
                clientname: req.body.clientname,
                projectname: req.body.projectname
            }
        });
        const price = await stripe.prices.create({
            unit_amount: amount * 100,
            currency: 'inr',
            product: product.id,
            metadata: {
                clientname: req.body.clientname,
                projectname: req.body.projectname
            }
        });

        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            metadata: {
                clientname: req.body.clientname,
                projectname: req.body.projectname
            }
        });

        // console.log(paymentLink)
        const project = await Project.findOneAndUpdate({ clientname: req.body.clientname, projectname: req.body.projectname }, { paymentLink: paymentLink.url, paymentLinkId: paymentLink.id });
        // const balanceTransactions = await stripe.balanceTransactions.list({
        //     limit: ,
        // });
        // const paymentIntents = await stripe.paymentIntents.list({
        //     limit: 3,
        // });

        res.send({ success: true, msg: "Invoice Generated Successfully." });
    }).catch((e) => console.log("Error!"));

}

//temp function for testing


module.exports = { generateInvoice };