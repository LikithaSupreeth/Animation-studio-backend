const Payment = require('../models/payment-model');

const paymentController = {};

// Create a new payment
paymentController.createPayment = async (req, res) => {
  const { client, amount, transactionDate, status, invoiceNumber, project } = req.body;
  try {
    const payment = new Payment({
      client,
      amount,
      transactionDate,
      status,
      invoiceNumber,
      project,
    });
    await payment.save();
    res.status(201).json(payment);
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
