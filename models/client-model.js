
// // # name: String
// // # contactInformation: String
// // # feedback: String
// // # paymentHistory: Array of Payment references
// const mongoose = require("mongoose");
// const { Schema, model } = mongoose;

// const clientSchema = new Schema(
//   {
//     name: {
//       type: String,
      
//     },
//     contactInformation: {
//       type: String,
     
//     },
//     feedback: {
//       type: String,
//     },
//     projectHistory: [{
//       type: Schema.Types.ObjectId,
//       ref: "Project"
//     }],
//     paymentHistory: [{
//       type: Schema.Types.ObjectId,
//       ref: "Payment"
//     }],
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
     
//     },
//   },
//   { timestamps: true }
// );

// const Client = model("Client", clientSchema);

// module.exports = Client;

const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const Project = require("./project-model");
const Payment = require("./payment-model");
const Task = require("./task-model");
const User = require("./user-model");

const clientSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    contactInformation: { type: String },
    projectHistory: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    paymentHistory: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
    feedback: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

// Middleware to handle cascading deletions
clientSchema.pre('findOneAndDelete', async function (next) {
  const clientId = this.getQuery()['_id'];
  
  // Delete associated projects
  await Project.updateMany({ client: clientId }, { $unset: { client: '' } });
  
  // Delete associated payments
  await Payment.deleteMany({ client: clientId });
  
  // Delete associated tasks where the project belongs to this client
  const projects = await Project.find({ client: clientId });
  const projectIds = projects.map(project => project._id);
  await Task.deleteMany({ project: { $in: projectIds } });
  
  // Update users by removing projects and payments related to this client
  await User.updateMany(
    { projectHistory: { $in: projectIds } },
    { $pull: { projectHistory: { $in: projectIds }, paymentHistory: { $in: clientId } } }
  );
  
  next();
});

const Client = model('Client', clientSchema);

module.exports = Client;

