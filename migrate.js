const mongoose = require('mongoose');
const Project = require('./models/project-model');
const Task = require('./models/task-model');
require('dotenv').config();

console.log('DB_URL:', process.env.DB_URL);


mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to the database');

    // Get all tasks
    const tasks = await Task.find();

    // Check if the project exists for each task
    for (const task of tasks) {
      const project = await Project.findById(task.project);
      if (!project) {
        // If project does not exist, delete the task
        await Task.findByIdAndDelete(task._id);
        console.log(`Deleted task with ID ${task._id} as its project does not exist.`);
      }
    }

    console.log('Migration complete');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to the database', err);
  });
