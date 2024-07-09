const Task = require('../models/task-model');
const User = require('../models/user-model');
const Project = require('../models/project-model')

const taskController = {};

// Create a new task

// Create a new task
taskController.createTask = async (req, res) => {
  const { name, description, dueDate, status, assignedAnimator, project } = req.body;
  try {
    // Check if the assigned user is an animator
    const animator = await User.findById(assignedAnimator);
    if (!animator || animator.role !== 'Animator') {
      return res.status(400).json({ error: 'Assigned user must be an Animator' });
    }

    const task = new Task({
      name,
      description,
      dueDate,
      status,
      assignedAnimator,
      project,
      createdBy: req.user.userId,
    });
    await task.save();

    // Associate the task with the project
    await Project.findByIdAndUpdate(
      project,
      { $push: { tasks: task._id } },
      { new: true }
    );

    // Update task history for the assigned animator
    await User.findByIdAndUpdate(
      assignedAnimator,
      { $push: { taskHistory: task._id } },
      { new: true }
    );

    // Populate the assignedAnimator field with user details
    const populatedTask = await Task.findById(task._id)
    .populate('assignedAnimator', 'name email role projectHistory')
    .populate('project', 'name description deadline status assignedTeamMembers tasks client createdBy')
    .populate('createdBy', 'name email role projectHistory paymentHistory createdAt updatedAt');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Get a single task by ID
taskController.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    .populate('assignedAnimator', 'name email role projectHistory')
    .populate('project', 'name description deadline status assignedTeamMembers tasks client createdBy')
    .populate('createdBy', 'name email role projectHistory paymentHistory createdAt updatedAt');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a task
taskController.updateTask = async (req, res) => {
  const updates = req.body;
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate('assignedAnimator', 'name email role projectHistory')
    .populate('project', 'name description deadline status assignedTeamMembers tasks client createdBy')
    .populate('createdBy', 'name email role projectHistory paymentHistory createdAt updatedAt');
  if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
taskController.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks
taskController.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
    .populate('assignedAnimator', 'name email role projectHistory')
    .populate('project', 'name description deadline status assignedTeamMembers tasks client createdBy')
    .populate('createdBy', 'name email role projectHistory paymentHistory createdAt updatedAt');
  res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = taskController;
