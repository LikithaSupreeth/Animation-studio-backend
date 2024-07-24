const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const Task = require('./task-model')
const Project = require('./project-model')

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    role: {
      type: String,
      enum: ["Admin", "Project Manager", "Animator", "Client"],
    },
    contactInformation: { type: String },
    projectHistory: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    paymentHistory: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
);

userSchema.pre('findOneAndDelete', async function(next) {
  const userId = this.getQuery()['_id'];
  
  // Remove user from tasks
  await Task.updateMany({ assignedAnimator: userId }, { assignedAnimator: null });

  // Remove user from projects
  await Project.updateMany({ createdBy: userId }, { createdBy: null });
  await Project.updateMany({ assignedTeamMembers: userId }, { $pull: { assignedTeamMembers: userId } });
  
  next();
});

const User = model("User", userSchema);

module.exports = User;
