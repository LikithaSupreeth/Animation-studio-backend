// const Client = require('../models/client-model');
// const Project = require('../models/project-model')
// const Payment = require('../models/payment-model')

// const clientController = {};

// // Create a new client
// clientController.createClient = async (req, res) => {
//   const { name, contactInformation, feedback, paymentHistory } = req.body;
//   try {
//     const client = new Client({
//       name,
//       contactInformation,
//       feedback,
//       paymentHistory,
//       createdBy: req.user.userId,
//     });
//     await client.save();
//     res.status(201).json(client);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get a single client by ID
// clientController.getClient = async (req, res) => {
//   try {
//     const client = await Client.findById(req.params.id)
//       .populate('paymentHistory createdBy')
//       .populate('projectHistory')
//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }
//     res.json(client);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update a client
// clientController.updateClient = async (req, res) => {
//   const updates = req.body;
//   try {
//     const client = await Client.findByIdAndUpdate(req.params.id, updates, { new: true })
//       .populate('paymentHistory createdBy')
//       .populate('projectHistory');

//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }
//     res.json(client);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete a client
// clientController.deleteClient = async (req, res) => {
//   try {
//     const client = await Client.findByIdAndDelete(req.params.id);
//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }
//     res.json({ message: 'Client deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Add feedback for a completed project
// clientController.addFeedback = async (req, res) => {
//   const { projectId, feedback } = req.body;
//   try {
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: 'Project not found' });
//     }
//     if (project.status !== 'Completed') {
//       return res.status(400).json({ message: 'Feedback can only be given for completed projects' });
//     }
//     const client = await Client.findById(req.params.id);
//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }
//     client.feedback.push({ project: projectId, feedback });
//     await client.save();
//     res.json(client);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Make a payment for a completed project
// clientController.makePayment = async (req, res) => {
//   const { projectId, amount, invoiceNumber } = req.body;
//   try {
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: 'Project not found' });
//     }
//     if (project.status !== 'Completed') {
//       return res.status(400).json({ message: 'Payments can only be made for completed projects' });
//     }
//     const payment = new Payment({
//       client: req.params.id,
//       project: projectId,
//       amount,
//       invoiceNumber,
//       status: 'Pending',
//     });
//     await payment.save();
//     const client = await Client.findByIdAndUpdate(
//       req.params.id,
//       { $push: { paymentHistory: payment._id } },
//       { new: true }
//     ).populate('paymentHistory createdBy')
//      .populate('projectHistory');
//     res.json(client);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get projects created by a client
// clientController.getProjectsByClient = async (req, res) => {
//   try {
//     const projects = await Project.find({ client: req.params.id })
//       .populate('assignedTeamMembers', 'name email role')
//       .populate('tasks')
//       .populate('client', 'name contactInformation')
//       .populate('createdBy', 'name email role');
//     res.json(projects);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // View payment requests
// clientController.viewPaymentRequests = async (req, res) => {
//   try {
//     const payments = await Payment.find({ client: req.params.id, status: 'Pending' })
//       .populate('project');
//     res.json(payments);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Complete a payment (invoked by the client)
// clientController.completePayment = async (req, res) => {
//   const { paymentId } = req.body;
//   try {
//     const payment = await Payment.findById(paymentId).populate('client project');
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }
//     if (payment.status !== 'Pending') {
//       return res.status(400).json({ message: 'Payment is already completed or not valid' });
//     }

//     // Create a payment intent with Stripe
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: payment.amount * 100, // Stripe expects the amount in paisa (smallest unit of INR)
//       currency: 'inr',
//       metadata: { client: payment.client._id.toString(), project: payment.project._id.toString() },
//     });

//     payment.invoiceNumber = paymentIntent.id;
//     await payment.save();

//     res.json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = clientController;

const Client = require('../models/client-model');
const Project = require('../models/project-model');
const Payment = require('../models/payment-model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_API_KEY);
const {sendPaymentCompletionEmail,sendProjectCompletionEmail} = require('../utility/nodemailer')

const clientController = {};

// Create a new client
clientController.createClient = async (req, res) => {
  const { name, email, contactInformation } = req.body;
  try {
    const client = new Client({
      name,
      email,
      contactInformation,
      createdBy: req.user.userId,
    });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single client by ID
clientController.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('paymentHistory')
      .populate('projectHistory')
      .populate('createdBy');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a client
clientController.updateClient = async (req, res) => {
  const updates = req.body;
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('paymentHistory')
      .populate('projectHistory')
      .populate('createdBy');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a client
clientController.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add feedback for a completed project
clientController.addFeedback = async (req, res) => {
  const { projectId, feedback } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.status !== 'Completed') {
      return res.status(400).json({ message: 'Feedback can only be given for completed projects' });
    }
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    client.feedback.push({ project: projectId, feedback });
    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Make a payment for a completed project
clientController.makePayment = async (req, res) => {
  const { projectId, amount, invoiceNumber } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.status !== 'Completed') {
      return res.status(400).json({ message: 'Payments can only be made for completed projects' });
    }

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: 'inr',
      metadata: { client: req.params.id, project: projectId },
    });

    const payment = new Payment({
      client: req.params.id,
      project: projectId,
      amount,
      invoiceNumber: paymentIntent.id,
      status: 'Pending',
    });
    await payment.save();

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { $push: { paymentHistory: payment._id } },
      { new: true }
    ).populate('paymentHistory')
      .populate('projectHistory')
      .populate('createdBy');
      
    res.json({ clientSecret: paymentIntent.client_secret, client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete the payment by the client using Stripe
clientController.completePayment = async (req, res) => {
  const { paymentId } = req.body;
  try {
    const payment = await Payment.findById(paymentId).populate('client project');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (payment.status !== 'Pending') {
      return res.status(400).json({ message: 'Payment is already completed or not valid' });
    }

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

// Get projects created by a client
clientController.getProjectsByClient = async (req, res) => {
  try {
    const projects = await Project.find({ client: req.params.id })
      .populate('assignedTeamMembers', 'name email role')
      .populate('tasks')
      .populate('client', 'name contactInformation')
      .populate('createdBy', 'name email role');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = clientController;

