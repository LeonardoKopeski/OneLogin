const nodemailer = require("nodemailer")
require("dotenv").config()

let transporter

function createTransporter(){
    transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASS, 
        }
    })
}

function sendEmail(to, emailInfo){
    transporter.sendMail({
        from: '"One Login Mailer" <oneloginbot@outlook.com>',
        to: to,
        subject: emailInfo.subject,
        html: emailInfo.html,
    })
}

function generateEmail(type, replace){
    if(type == "VerifyEmail"){
        return {
            subject: "Email Verification",
            html: "<h1>Click on the link below to verify your account OneLogin!</h1><a href='"+replace+"'>HERE!</a>"
        }
    }
}

module.exports = {
    createTransporter,
    sendEmail,
    generateEmail
}