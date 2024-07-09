const User = require("../models/user-model");

const userRegisterValidationSchema = {
  name: {
    exists: {
      errorMessage: "Name is required",
    },
    notEmpty: {
      errorMessage: "Name cannot be empty",
    },
    trim: true,
  },
  email: {
    exists: {
      errorMessage: "Email is required",
    },
    notEmpty: {
      errorMessage: "Email cannot be empty",
    },
    isEmail: {
      errorMessage: "Email should be a valid format",
    },
    custom: {
      options: async function (value) {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("email already taken");
        } else {
          return true;
        }
      },
    },
    trim: true,
    normalizeEmail: true,
  },
  password: {
    exists: {
      errorMessage: "Password is required",
    },
    notEmpty: {
      errorMessage: "Password cannot be empty",
    },
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: "Password should be between 8 - 128 characters",
    },
    trim: true,
  },
  role: {
    exists: {
      errorMessage: "Role is required",
    },
    notEmpty: {
      errorMessage: "Role cannot be empty",
    },
    isIn: {
      options: [["Admin", "Project Manager", "Animator", "Client"]],
      errorMessage:
        "Role should be one of Admin, Project Manager, Animator, or Client",
    },
    trim: true,
  },
};

const userUpdateValidations = {
  name: {
    exists: {
      errorMessage: "Name is required",
    },
    notEmpty: {
      errorMessage: "Name cannot be empty",
    },
    trim: true,
  },
  email: {
    exists: {
      errorMessage: "Email is required",
    },
    notEmpty: {
      errorMessage: "Email cannot be empty",
    },
    isEmail: {
      errorMessage: "Email should be a valid format",
    },

    trim: true,
    normalizeEmail: true,
  },
  password: {
    exists: {
      errorMessage: "Password is required",
    },
    notEmpty: {
      errorMessage: "Password cannot be empty",
    },
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: "Password should be between 8 - 128 characters",
    },
    trim: true,
  },
  role: {
    exists: {
      errorMessage: "Role is required",
    },
    notEmpty: {
      errorMessage: "Role cannot be empty",
    },
    isIn: {
      options: [["Admin", "Project Manager", "Animator", "Client"]],
      errorMessage:
        "Role should be one of Admin, Project Manager, Animator, or Client",
    },
    trim: true,
  },
};

module.exports = { userRegisterValidationSchema, userUpdateValidations };

// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/LikithaSupreeth/Animation-studio.git
// git push -u origin main
