const nodemailer = require('nodemailer')
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.NODEMAILER_FROM_EMAIL,
        pass:  process.env.NODEMAILER_FROM_PASSWORD
    }
});

const sendRegisterEmail = (assignedUserEmail) => {
    const mailBody = {
        from: process.env.NODEMAILER_FROM_EMAIL,
        to: assignedUserEmail,
        subject: 'Welcome to my Animation Studio',
        html: `<p>Hello,</p>
                <p>Congratulation! Your account has been created</p>
                <p>Thankyou for registering with us</p>`
    }

    transporter.sendMail(mailBody, (error, info) => {
        if (error) {
            console.log('Error While sending Email', error.message)
        } else {
            console.log('Email sent successfully', info.response)
        }
    })
}

module.exports = {sendRegisterEmail}