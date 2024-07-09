const mongoose = require("mongoose");
const { Schema, model } = mongoose;

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

const User = model("User", userSchema);

module.exports = User;
