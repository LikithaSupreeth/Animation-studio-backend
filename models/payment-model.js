
// client: Client reference
// amount: Number
// transactionDate: Date
// status: Enum (Pending, Completed)
// invoiceNumber: String
// project: Project reference

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const paymentSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
  
    },
    amount: {
      type: Number,
      
    },
    transactionDate: {
      type: Date,
      default: Date.now,
     
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
      
    },
    invoiceNumber: {
      type: String,
     
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    
    },
  },
  { timestamps: true }
);

const Payment = model("Payment", paymentSchema);

module.exports = Payment;
