// const Payment = require('../models/payment-model');

// const paymentController = {};

// // Create a new payment
// paymentController.createPayment = async (req, res) => {
//   const { client, amount, transactionDate, status, invoiceNumber, project } = req.body;
//   try {
//     const payment = new Payment({
//       client,
//       amount,
//       transactionDate,
//       status,
//       invoiceNumber,
//       project,
//     });
//     await payment.save();
//     res.status(201).json(payment);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get a single payment by ID
// paymentController.getPayment = async (req, res) => {
//   try {
//     const payment = await Payment.findById(req.params.id)
//       .populate('client project');
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }
//     res.json(payment);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update a payment
// paymentController.updatePayment = async (req, res) => {
//   const updates = req.body;
//   try {
//     const payment = await Payment.findByIdAndUpdate(req.params.id, updates, { new: true })
//       .populate('client project');
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }
//     res.json(payment);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete a payment
// paymentController.deletePayment = async (req, res) => {
//   try {
//     const payment = await Payment.findByIdAndDelete(req.params.id);
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }
//     res.json({ message: 'Payment deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = paymentController;

// const Stripe = require('stripe');
// const Payment = require('../models/payment-model')

// const stripe = Stripe(process.env.STRIPE_SECRET_API_KEY)

// const paymentController = {};

// // Create a new payment using Stripe
// paymentController.createPayment = async (req, res) => {
//   const { client, amount, project } = req.body;
//   try {
//     // Create a payment intent with Stripe
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount * 100,
//       currency: 'inr',
//       metadata: { client, project },
//     });

//     const payment = new Payment({
//       client,
//       amount,
//       transactionDate: new Date(),
//       status: 'Pending',
//       invoiceNumber: paymentIntent.id,
//       project,
//     });
//     await payment.save();

//     res.status(201).json({ payment, clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get a single payment by ID
// paymentController.getPayment = async (req, res) => {
//   try {
//     const payment = await Payment.findById(req.params.id)
//       .populate('client project');
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }
//     res.json(payment);
//   } catch (error) {
//     res.status (500).json({ error: error.message });
//   }
// };

// // Update a payment
// paymentController.updatePayment = async (req, res) => {
//   const updates = req.body;
//   try {
//     const payment = await Payment.findByIdAndUpdate(req.params.id, updates, { new: true })
//       .populate('client project');
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }
//     res.json(payment);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete a payment
// paymentController.deletePayment = async (req, res) => {
//   try {
//     const payment = await Payment.findByIdAndDelete(req.params.id);
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }
//     res.json({ message: 'Payment deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = paymentController;

const Payment = require('../models/payment-model')
const stripe = require('stripe')(process.env.STRIPE_SECRET_API_KEY);
const {sendPaymentCompletionEmail} = require('../utility/nodemailer')

const paymentController = {};

// Create a new payment request by the project manager
paymentController.createPaymentRequest = async (req, res) => {
  const { client, amount, project } = req.body;
  try {
    const payment = new Payment({
      client,
      amount,
      transactionDate: new Date(),
      status: 'Pending',
      project,
    });
    await payment.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete the payment by the client using Stripe
paymentController.completePayment = async (req, res) => {
  const { paymentId } = req.body;
  try {
    const payment = await Payment.findById(paymentId).populate('client project');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (payment.status !== 'Pending') {
      return res.status(400).json({ message: 'Payment is already completed or not valid' });
    }

    // // Create a payment intent with Stripe
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: payment.amount * 100,
    //   currency: 'inr',
    //   metadata: { client: payment.client._id.toString(), project: payment.project._id.toString() },
    // });

    // payment.invoiceNumber = paymentIntent.id;
    // await payment.save();

    // res.json({ clientSecret: paymentIntent.client_secret });

     // Confirm the payment intent with Stripe
     const paymentIntent = await stripe.paymentIntents.retrieve(payment.invoiceNumber);
     if (paymentIntent.status !== 'succeeded') {
       return res.status(400).json({ message: 'Payment was not successful' });
     }
 
     payment.status = 'Completed';
     await payment.save();
 
     sendPaymentCompletionEmail(payment.client.email, 'Payment Completed', `Your payment of ${payment.amount} INR for the project ${payment.project.name} has been completed successfully.`);
     sendPaymentCompletionEmail(process.env.ADMIN_EMAIL, 'Payment Completed', `Payment of ${payment.amount} INR for the project ${payment.project.name} has been completed successfully by client ${payment.client.name}.`);
 
     res.json({ message: 'Payment completed successfully', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single payment by ID
paymentController.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('client project');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a payment
paymentController.updatePayment = async (req, res) => {
  const updates = req.body;
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('client project');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a payment
paymentController.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = paymentController;


