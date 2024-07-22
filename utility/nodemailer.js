const nodemailer = require('nodemailer')


// Create a transporter using the SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.NODEMAILER_FROM_EMAIL,
        pass:  process.env.NODEMAILER_FROM_PASSWORD
    }
});

// Function to send registration email to new users
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

// Function to send project completion email to clients
const sendProjectCompletionEmail = (clientEmail, projectName, amount) => {
    const mailBody = {
        from: process.env.NODEMAILER_FROM_EMAIL,
        to: clientEmail,
        subject: 'Project Completed - Payment Required',
        html: `<p>Hello,</p>
               <p>Your project "${projectName}" has been completed.</p>
               <p>Please make the payment of INR ${amount}.</p>
               <p>Thank you for your business!</p>`
    };

    transporter.sendMail(mailBody, (error, info) => {
        if (error) {
            console.log('Error While sending Email', error.message);
        } else {
            console.log('Email sent successfully', info.response);
        }
    });
};

// Function to send payment completion email to clients and admins
const sendPaymentCompletionEmail = (clientEmail, adminEmail, projectName, amount) => {
    const mailBody = {
        from: process.env.NODEMAILER_FROM_EMAIL,
        to: clientEmail,
        subject: 'Payment Completed',
        html: `<p>Hello,</p>
               <p>Your payment of INR ${amount} for project "${projectName}" has been completed.</p>
               <p>Thank you for your business!</p>`
    };

    transporter.sendMail(mailBody, (error, info) => {
        if (error) {
            console.log('Error While sending Email', error.message);
        } else {
            console.log('Email sent successfully', info.response);
        }
    });

    const adminMailBody = {
        from: process.env.NODEMAILER_FROM_EMAIL,
        to: adminEmail,
        subject: 'Payment Completed - Notification',
        html: `<p>Hello,</p>
               <p>A payment of INR ${amount} for project "${projectName}" has been completed by the client.</p>
               <p>Thank you!</p>`
    };

    transporter.sendMail(adminMailBody, (error, info) => {
        if (error) {
            console.log('Error While sending Email', error.message);
        } else {
            console.log('Email sent successfully', info.response);
        }
    });
};

// Function to send task completion email to project manager
const sendTaskCompletionEmail = (managerEmail, taskName) => {
    const mailBody = {
        from: process.env.NODEMAILER_FROM_EMAIL,
        to: managerEmail,
        subject: 'Task Completed - Review Required',
        html: `<p>Hello,</p>
               <p>The task "${taskName}" has been completed by the animator.</p>
               <p>Please review and approve if everything is satisfactory.</p>`
    };

    transporter.sendMail(mailBody, (error, info) => {
        if (error) {
            console.log('Error While sending Email', error.message);
        } else {
            console.log('Email sent successfully', info.response);
        }
    });
};

module.exports = {
    sendRegisterEmail,
    sendProjectCompletionEmail,
    sendPaymentCompletionEmail,
    sendTaskCompletionEmail
};

