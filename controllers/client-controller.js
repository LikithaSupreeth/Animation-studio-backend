const Client = require('../models/client-model');

const clientController = {};

// Create a new client
clientController.createClient = async (req, res) => {
  const { name, contactInformation, feedback, paymentHistory } = req.body;
  try {
    const client = new Client({
      name,
      contactInformation,
      feedback,
      paymentHistory,
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
      .populate('paymentHistory createdBy');
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
      .populate('paymentHistory createdBy');
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

module.exports = clientController;
