
// name: String
// description: String
// dueDate: Date
// status: Enum (Not Started, In Progress, Completed)
// assignedAnimator: User reference (Animator)
// project: Project reference

const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const Project = require('./project-model')
const User = require('./user-model')

const taskSchema = new Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    assignedAnimator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Middleware to handle cascading updates when a task is deleted
taskSchema.pre('findOneAndDelete', async function (next) {
  const taskId = this.getQuery()['_id'];

  // Remove task reference from project
  await Project.updateMany(
    { tasks: taskId },
    { $pull: { tasks: taskId } }
  );

  // Remove task reference from user's taskHistory
  await User.updateMany(
    { taskHistory: taskId },
    { $pull: { taskHistory: taskId } }
  );

  next();
});

const Task = model("Task", taskSchema);

module.exports = Task;
