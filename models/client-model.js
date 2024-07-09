
// # name: String
// # contactInformation: String
// # feedback: String
// # paymentHistory: Array of Payment references
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const clientSchema = new Schema(
  {
    name: {
      type: String,
      
    },
    contactInformation: {
      type: String,
     
    },
    feedback: {
      type: String,
    },
    projectHistory: [{
      type: Schema.Types.ObjectId,
      ref: "Project"
    }],
    paymentHistory: [{
      type: Schema.Types.ObjectId,
      ref: "Payment"
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
     
    },
  },
  { timestamps: true }
);

const Client = model("Client", clientSchema);

module.exports = Client;
