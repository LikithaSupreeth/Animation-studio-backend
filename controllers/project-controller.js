const Project = require('../models/project-model');
const User = require('../models/user-model')
const Client = require('../models/client-model')
const Payment = require('../models/payment-model')
const {sendProjectCompletionEmail} = require('../utility/nodemailer')

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
        { $push: { paymentHistory: payment._id, projectHistory: project._id } },

        // { $push: { paymentHistory: payment._id } },
        { new: true }
      );


     // Update project history for each assigned user
     for (const userId of assignedTeamMembers) {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { projectHistory: project._id } },
        { new: true }
      );
    }

     // Update project history for the user who created the project
     await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { projectHistory: project._id } },
      { new: true }
    );
   
    // Update project history for the client
    
    if(client){
      await Client.findByIdAndUpdate(
      client,
      { $addToSet: { projectHistory: project._id } },
      { new: true }
    )
  }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single project by ID
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
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



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

// delete project
projectController.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { assignedTeamMembers, client, _id: projectId } = project;

    // Remove the project reference from each assigned user's projectHistory array
    for (const userId of assignedTeamMembers) {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { projectHistory: projectId } },
        { new: true }
      );
    }

    // Remove the project reference from the client's projectHistory array
    await Client.findByIdAndUpdate(
      client,
      { $pull: { projectHistory: projectId } },
      { new: true }
    );

    // Remove the project reference from the user who created it
    await User.findByIdAndUpdate(
      project.createdBy,
      { $pull: { projectHistory: projectId } },
      { new: true }
    );

    // Delete associated payments
    await Payment.deleteMany({ project: projectId });

    // Finally, delete the project
    await Project.findByIdAndDelete(projectId);

    res.json({ message: 'Project deleted successfully', project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Approve task and mark project as completed
projectController.approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task status
    task.status = 'Approved';
    await task.save();

    // Check if all tasks in the project are completed
    const project = await Project.findById(task.project);
    const allTasks = await Task.find({ project: task.project });
    const allTasksCompleted = allTasks.every(tasks => tasks.status === 'Approved');

    if (allTasksCompleted) {
      project.status = 'Completed';
      await project.save();

      // Notify the client about project completion
      const client = await Client.findById(project.client);
      sendProjectCompletionEmail(client.email, 'Project Completed', `Your project "${project.name}" has been completed. Please make the payment and provide your feedback.`);
    }

    res.json({ message: 'Task approved and project status updated if all tasks are completed', project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = projectController;
