# user model

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

# task model

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
    assignedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    allowClient: BOolean, 
}

# comment
task : ObjectId 
title: String,
Body: String
commentBy: ObjectId 
fileUrl 

# project model 

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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      
    },
  },

# payment model 

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


# file model 

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
    docId: {
      type: Schema.Types.ObjectId
      
    },
    uploadDate: {
      type: Date,
      default: Date.now,
      
    },
    model : {
      type: String // Project, Task, Comment
    }
  },

# client model 

{
    name: {
      type: String,
      
    },
    contactInformation: {
      type: String,
     
    },
    projectBriefs: [{
      type: Schema.Types.ObjectId,
      ref: "Project"
    }],
    feedback: {
      type: String,
    },
    paymentHistory: [{
      type: Schema.Types.ObjectId,
      ref: "Payment"
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
     
    },
  },

# comment model 
