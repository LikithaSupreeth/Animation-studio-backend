// name: String
// description: String
// deadline: Date
// status: Enum (Planned, In-Progress, Completed)
// assignedTeamMembers: Array of User references (Animators, Project Managers)
// tasks: Array of Task references
// client: Client reference


const mongoose = require("mongoose");
const { Schema, model } = mongoose;

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

const Project = model("Project", projectSchema);

module.exports = Project;

