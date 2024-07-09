
// fileName: String
// fileType: String
// fileSize: Number
// uploadedBy: User reference
// project: Project reference
// uploadDate: Date

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const fileSchema = new Schema(
  {
    fileName: {
      type: String,
     
    },
    fileType: {
      type: String,
      
    },
    fileSize: {
      type: Number,
      
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
     
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      
    },
    uploadDate: {
      type: Date,
      default: Date.now,
      
    },
  },
  { timestamps: true }
);

const File = model("File", fileSchema);

module.exports = File;
