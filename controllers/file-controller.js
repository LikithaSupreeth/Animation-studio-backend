const File = require('../models/file-model');

const fileController = {};

// Upload a new file
fileController.uploadFile = async (req, res) => {
  const { fileName, fileType, fileSize, project } = req.body;
  try {
    const file = new File({
      fileName,
      fileType,
      fileSize,
      uploadedBy: req.user.userId,
      project,
      uploadDate: Date.now(),
    });
    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single file by ID
fileController.getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate('uploadedBy project');
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a file
fileController.updateFile = async (req, res) => {
  const updates = req.body;
  try {
    const file = await File.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('uploadedBy project');
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a file
fileController.deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = fileController;
