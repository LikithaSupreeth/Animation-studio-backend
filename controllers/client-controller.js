const Client = require('../models/client-model');
const Project = require('../models/project-model');
const Payment = require('../models/payment-model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_API_KEY);
const generateInvoiceNumber = require('../utility/invoiceNumber')
const {sendPaymentCompletionEmail,sendProjectCompletionEmail} = require('../utility/nodemailer')

const clientController = {};

// Create a new client
clientController.createClient = async (req, res) => {
  const { name, email, contactInformation } = req.body;
  try {
    if (req.user.role !== 'Client') {
      return res.status(403).json({ message: 'You are not authorized to create a client.' });
    }
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
    // if (req.user.role !== 'Client' || req.user.userId !== req.params.id) {
    //   return res.status(403).json({ message: 'You are not authorized to view this information.' });
    // }
    const client = await Client.findById(req.params.id)
      .populate('paymentHistory')
      .populate('projectHistory')
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

     if (req.user.role !== 'Client' || req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'You are not authorized to view this information.' });
    }
    
    const client = await Client.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('paymentHistory')
      .populate('projectHistory')
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
    if (project.client.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to give feedback for this project.' });
    }
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    client.feedback.push({ project: projectId, feedback });
    await client.save();
    res.json(client);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

// Make a payment for a completed project
clientController.makePayment = async (req, res) => {
  const { projectId, amount } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.status !== 'Completed') {
      return res.status(400).json({ message: 'Payments can only be made for completed projects' });
    }
    if (project.client.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to make a payment for this project.' });
    }

    const invoiceNumber = generateInvoiceNumber();

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: 'inr',
      metadata: { client: req.user.userId, project: projectId },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      }
    });

    // console.log('Created Stripe Payment Intent:', paymentIntent);


    const payment = new Payment({
      client: req.user.userId,
      project: projectId,
      amount,
      invoiceNumber: invoiceNumber,
      stripePaymentIntentId: paymentIntent.id,
      status: 'Pending',
    });
    await payment.save();

    // console.log('Payment created with Stripe Payment Intent ID:', paymentIntent.id);


    const client = await Client.findByIdAndUpdate(
      req.user.userId,
      { $push: { paymentHistory: payment._id } },
      { new: true }
    ).populate('paymentHistory')
      .populate('projectHistory')
      

      
    res.json({ clientSecret: paymentIntent.client_secret, client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete the payment by the client using Stripe
clientController.completePayment = async (req, res) => {
  const { paymentId } = req.body;
  try {
    // console.log('Received paymentId:', paymentId);  // Logging the received paymentId

    const payment = await Payment.findById(paymentId).populate('client project');
    // console.log('Retrieved Payment:', payment);  // Logging the retrieved payment document

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (payment.status !== 'Pending') {
      return res.status(400).json({ message: 'Payment is already completed or not valid' });
    }

    // console.log('Stripe Payment Intent ID:', payment.stripePaymentIntentId);

     // Ensure stripePaymentIntentId is not undefined or null
     if (!payment.stripePaymentIntentId) {
      throw new Error('stripePaymentIntentId is not defined');
    }
    
    // Confirm the payment intent with Stripe
    let paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
    // console.log('Retrieved Stripe Payment Intent:', paymentIntent);
    // if (paymentIntent.status !== 'succeeded') {
    //   return res.status(400).json({ message: 'Payment was not successful' });
    // }


    if (paymentIntent.status === 'requires_payment_method') {

        // // Use a test token to complete the payment
        // const testToken = 'tok_visa'; // Stripe's test token for Visa card


      // // Use a test card to complete the payment
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          // number: '4242424242424242',
          // exp_month: 12,
          // exp_year: 2024,
          // cvc: '123',
          token: 'tok_visa',
        },
      });
  
      paymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
        // // payment_method: testToken,
        // source: testToken,
        payment_method: paymentMethod.id,

        
      });

      // console.log('Confirmed Stripe Payment Intent:', paymentIntent);
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment was not successful' });
    }
    
    //     // Retrieve the payment intent again to check the status
    // const confirmedPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
    // console.log('Confirmed Stripe Payment Intent:', confirmedPaymentIntent);

    // if (confirmedPaymentIntent.status !== 'succeeded') {
    //   return res.status(400).json({ message: 'Payment was not successful' });
    // }


    payment.status = 'Completed';
    await payment.save();

    const project = await Project.findByIdAndUpdate(
      payment.project._id,
      { $push: { payments: payment._id } },
      { new: true }
    );


    sendPaymentCompletionEmail(payment.client.email, 'Payment Completed', `Your payment of ${payment.amount} INR for the project ${payment.project.name} has been completed successfully.`);
    sendPaymentCompletionEmail(process.env.ADMIN_EMAIL, 'Payment Completed', `Payment of ${payment.amount} INR for the project ${payment.project.name} has been completed successfully by client ${payment.client.name}.`);

    res.json({ message: 'Payment completed successfully', payment });
  } catch (error) {
    console.log(error)
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

