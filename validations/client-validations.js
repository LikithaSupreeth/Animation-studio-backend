const clientValidationSchema = {
  name: {
    exists: {
      errorMessage: 'Client name is required',
    },
    notEmpty: {
      errorMessage: 'Client name cannot be empty',
    },
    trim: true,
  },
  email: {
    exists: {
      errorMessage: 'Email is required',
    },
    notEmpty: {
      errorMessage: 'Email cannot be empty',
    },
    isEmail: {
      errorMessage: 'Invalid email format',
    },
    trim: true,
  },
  contactInformation: {
    exists: {
      errorMessage: 'Contact information is required',
    },
    notEmpty: {
      errorMessage: 'Contact information cannot be empty',
    },
    trim: true,
  },
  feedback: {
    optional: true,
    isArray: {
      errorMessage: 'Feedback must be an array of project references',
    },
  },
};

module.exports = clientValidationSchema;
