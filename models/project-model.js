// name: String
// description: String
// deadline: Date
// status: Enum (Planned, In-Progress, Completed)
// assignedTeamMembers: Array of User references (Animators, Project Managers)
// tasks: Array of Task references
// client: Client reference


const mongoose = require("mongoose");
const Client = require("./client-model");
const { Schema, model } = mongoose;
const Task = require('./task-model')
const User = require('./user-model')


const projectSchema = new Schema(
  {
    name: {
      type: String,
      
    },
    description: {
      type: String,
  
    },
    deadline: {
      type: Date,
     
    },
    status: {
      type: String,
      enum: ["Planned", "In-Progress", "Completed"],
      default: "Planned",
    },
    assignedTeamMembers: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    tasks: [{
      type: Schema.Types.ObjectId,
      ref: "Task",
    }],
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
     
    },
    payments: [{
      type: Schema.Types.ObjectId,
      ref: "Payment",
    }],
    
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
      
    },
    
  },
  { timestamps: true }
);

// Middleware to handle cascading updates when a project is deleted
projectSchema.pre('findOneAndDelete', async function (next) {
  const projectId = this.getQuery()['_id'];
  
  // Delete associated tasks
  await Task.deleteMany({ project: projectId });

  // Remove project reference from users' projectHistory
  await User.updateMany(
    { projectHistory: projectId },
    { $pull: { projectHistory: projectId } }
  );

  // Remove project reference from client's projectHistory
  await Client.updateMany(
    { projectHistory: projectId },
    { $pull: { projectHistory: projectId } }
  );

  next();
});

const Project = model("Project", projectSchema);

module.exports = Project;

