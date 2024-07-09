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
    contactInformation: {
      exists: {
        errorMessage: 'Contact information is required',
      },
      notEmpty: {
        errorMessage: 'Contact information cannot be empty',
      },
      trim: true,
    },
  };