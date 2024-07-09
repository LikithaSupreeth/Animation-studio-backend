const Project = require('../models/project-model');
const User = require('../models/user-model')
const Client = require('../models/client-model')
const Payment = require('../models/payment-model')

const projectController = {};

// Create a new project
projectController.createProject = async (req, res) => {
  const { name, description, deadline, assignedTeamMembers, tasks, client } = req.body;
  try {
    const project = new Project({
      name,
      description,
      deadline,
      status: "Planned",
      assignedTeamMembers,
      tasks,
      client,
      createdBy: req.user.userId,
    })
      await project.save();

      //  pending payment for the project
    const payment = new Payment({
      client,
      project: project._id,
      status: "Pending",
    });
    await payment.save();

      // Update payment history for the user who created the project
      await User.findByIdAndUpdate(
        req.user.userId,
        { $push: { paymentHistory: payment._id } },
        { new: true }
      );


     // Update project history for each assigned user
     for (const userId of assignedTeamMembers) {
      await User.findByIdAndUpdate(
        userId,
        { $push: { projectHistory: project._id } },
        { new: true }
      );
    }

     // Update project history for the user who created the project
     await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { projectHistory: project._id } },
      { new: true }
    );
   
    // Update project history for the client
    await Client.findByIdAndUpdate(
      client,
      { $push: { projectHistory: project._id } },
      { new: true }
    )

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single project by ID
// projectController.getProject = async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id)
//       .populate('assignedTeamMembers tasks client createdBy');
//     if (!project) {
//       return res.status(404).json({ message: 'Project not found' });
//     }
//     res.json(project);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

projectController.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    .populate('assignedTeamMembers', 'name email role projectHistory paymentHistory createdAt updatedAt')
    .populate({
      path: 'tasks',
      select: 'name description dueDate status assignedAnimator createdAt updatedAt',
      populate: { path: 'assignedAnimator', select: 'name email role projectHistory' }
    })
    .populate('client')
    .populate({
      path: 'createdBy',
      select: 'name email role projectHistory paymentHistory createdAt updatedAt',
      populate: { path: 'paymentHistory', select: 'status' }

      // //.populate('assignedTeamMembers', 'name email role projectHistory paymentHistory createdAt updatedAt')
      // .populate('tasks')
      // .populate('client')
      // //.populate('createdBy','name role paymentHistory')
      // .populate({
      //   path: 'createdBy',
      //   select: 'name email role projectHistory paymentHistory createdAt updatedAt',
      //   populate: { path: 'paymentHistory', select: 'status' }
      });

      //.populate('createdBy', 'name email role projectHistory paymentHistory createdAt updatedAt');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all projects 
// projectController.getAllProjects = async (req, res) => {
//   try {
//     const projects = await Project.find()
//       .populate('assignedTeamMembers tasks client createdBy').select(-);
//     res.json(projects);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

projectController.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
    .populate('assignedTeamMembers', 'name email role projectHistory paymentHistory createdAt updatedAt')
    .populate('tasks')
    .populate('client', 'name contactInformation projectHistory')
    .populate({
      path: 'createdBy',
      select: 'name email role projectHistory paymentHistory createdAt updatedAt',
      populate: { path: 'paymentHistory', select: 'status' }
    });

      // //.populate('assignedTeamMembers', 'name email role projectHistory paymentHistory createdAt updatedAt')
      // .populate('tasks')
      // .populate('client', 'name contactInformation projectHistory')
      // //.populate('createdBy', 'name email role projectHistory paymentHistory createdAt updatedAt');
      // .populate('createdBy','name role paymentHistory')
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a project
projectController.updateProject = async (req, res) => {
  const updates = req.body;
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, updates, { new: true })
      // //.populate('assignedTeamMembers tasks client createdBy')
      // .populate('tasks')
      // .populate('client')
      // .populate('createdBy','name role paymentHistory')
      .populate('assignedTeamMembers', 'name email role projectHistory paymentHistory createdAt updatedAt')
      .populate('tasks')
      .populate('client', 'name contactInformation projectHistory')
      .populate({
        path: 'createdBy',
        select: 'name email role projectHistory paymentHistory createdAt updatedAt',
        populate: { path: 'paymentHistory', select: 'status' }
      });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a project
projectController.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = projectController;
