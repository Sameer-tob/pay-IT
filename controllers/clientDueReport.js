const nodemailer = require("nodemailer");
const Projects = require("../models/Projects");
const moment = require("moment");
const Users = require("../models/User")
//require("dotenv").config()



const sendmail = async (type, due) => {
console.log(process.env.MAIL_USERNAME,process.env.MAIL_APP_PASS);
  try {
    var transporter = nodemailer.createTransport({
      // host: "smtp.ethereal.email",
      // port: 587,
      // secure: false, // true for 465, false for other ports
      service: "Gmail",
      auth: {
        user: "payitnotificationservices@gmail.com",
        pass: "vluqlikfocbmwlfy"
      }
    });
  }
  catch (e) { console.log(e, 11) }

  const user = await Users.findById(due.owner)
  var sub, text
  if (type == "overdued") {
    sub = "Reminder for Overdue Payment"
    text = `
        <p>I hope this email finds you in good health and high spirits. I am writing to remind you about an overdue payment that has been outstanding for some time now.</p>
        <p>As per our records, your account shows a balance of ${due.amount}. The payment was due on ${moment(due.dueDate).format("MMM Do YY")}, but we have yet to receive it. Your prompt attention to this matter is greatly appreciated.</p>
        <p>If you have already made the payment, please ignore this reminder and accept our apologies for the inconvenience. If you need assistance with the payment or have any questions, please do not hesitate to contact us.</p>
        <p>We value your business and hope to resolve this issue promptly. Please find the payment details below:</p>`
  }
  else if (type == "dueToday") {
    sub = "Reminder - Bill Payment Due Today"
    text = `<p>This email serves as a friendly reminder that your bill payment of ${due.amount} is due today. Your timely payment is important to us and helps us maintain accurate records and provide you with continued quality service.</p>
        <p>As per our records, your account shows a balance of ${due.amount}. The payment is due on ${moment(due.dueDate).format("MMM Do YY")}, but we have yet to receive it. Your prompt attention to this matter is greatly appreciated.</p>
        <p>If you have already made the payment, please ignore this reminder and accept our apologies for the inconvenience. If you need assistance with the payment or have any questions, please do not hesitate to contact us.</p>
        <p>We value your business and hope to resolve this issue promptly. Please find the payment details below:</p>`
  }
  else if (type == "due") {
    sub = `Reminder - Bill Payment Due in ${due.daysleft} days`
    text = `<p>This email serves as a friendly reminder that your bill payment of ${due.amount} is due in ${due.daysleft} days. Your timely payment is important to us and helps us maintain accurate records and provide you with continued quality service.</p>
        <p>As per our records, your account shows a balance of ${due.amount}. The payment is due on ${moment(due.dueDate).format("MMM Do YY")}, but we have yet to receive it. Your prompt attention to this matter is greatly appreciated.</p>
        <p>If you have already made the payment, please ignore this reminder and accept our apologies for the inconvenience. If you need assistance with the payment or have any questions, please do not hesitate to contact us.</p>
        <p>We value your business and hope to resolve this issue promptly. Please find the payment details below:</p>`
  }


  texttemplate = `<html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid black;
          padding: 8px;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
    <p>Dear ${due.clientname},</p>
      ${text}  
      <table>
        <tr>
          <th>Invoice Link</th>
          <th>Due Date</th>
          <th>Amount Due</th>
          <th>Payment Link</th>
        </tr>
        <tr>
          <td><a href=${due.invoice}>Click Here to Download</a></td>
          <td>${moment(due.dueDate).format("DD/MM/YYYY")}</td>
          <td>${due.amount}</td>
          <td>${due.paymentLink}</td>
        </tr>
      </table>
      <p>Thank you for your time and consideration. We look forward to your prompt payment.</p>
      <p>Best regards,</p>
      <p>${user.name}</p>
      <p>${user.organization}</p>
    </body>
  </html>`
  let info = await transporter.sendMail({
    from: "payitnotificationservices@gmail.com", // sender address
    to: "sameermonarch279@gmail.com", // list of receivers
    subject: sub, // Subject line
    html: texttemplate, // plain text body
    // html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
}

const paymentDueReport = async () => {

  // // create reusable transporter object using the default SMTP transport

  const duePayments = await Projects.aggregate([
    {
      $match: {
        paymentstatus: false,
        invoiceGenerated: true,
      }
    },
    {
      //lookups -> looking into another collection to match/group
      $lookup: {
        from: "clients", // assets Model
        localField: "clientId", // current collection's field
        foreignField: "_id", // targetted collection's field
        as: "client", // alias
      },
    },
    {
      // Deconstructs an array field from the input documents to output a document for each element.
      $unwind: "$client",
    },
    {
      $addFields: {
        daysleft: { $floor: { $divide: [{ $subtract: ["$dueDate", new Date()] }, (1000 * 60 * 60 * 24)] } },///need to work here more
        owner: "$client.owner"
      }
    }
  ]);
  console.log(duePayments)
  var overduedMail = []
  var duenext3Mail = []
  var duenext5Mail = []
  var duetodayMail = []
  duePayments.forEach(due => {
    if (due.daysleft < 0) {
      // overduedMail.push(due)
      sendmail("overdued", due)
    }
    else if (due.daysleft >= 0 && due.daysleft < 1) {
      sendmail("dueToday", due)
    }
    else if (due.daysleft < 7) {
      sendmail("due", due)
    }
  });

  // console.log(overduedMail, duetodayMail, duenext3Mail, duenext5Mail, 222)
  // overduedMail.forEach(async (due) => {
  //   sendmail("overdued");
  // })


}


module.exports = { paymentDueReport }


