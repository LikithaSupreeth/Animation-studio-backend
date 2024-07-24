
// name: String
// description: String
// dueDate: Date
// status: Enum (Not Started, In Progress, Completed)
// assignedAnimator: User reference (Animator)
// project: Project reference

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

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

const Task = model("Task", taskSchema);

module.exports = Task;
