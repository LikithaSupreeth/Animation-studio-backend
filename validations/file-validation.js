const fileValidationSchema = {
    fileName: {
      exists: {
        errorMessage: 'File name is required',
      },
      notEmpty: {
        errorMessage: 'File name cannot be empty',
      },
      trim: true,
    },
    fileType: {
      exists: {
        errorMessage: 'File type is required',
      },
      notEmpty: {
        errorMessage: 'File type cannot be empty',
      },
      trim: true,
    },
    fileSize: {
      exists: {
        errorMessage: 'File size is required',
      },
      notEmpty: {
        errorMessage: 'File size cannot be empty',
      },
      isNumeric: {
        errorMessage: 'File size must be a number',
      },
    },
    project: {
      exists: {
        errorMessage: 'Project reference is required',
      },
      notEmpty: {
        errorMessage: 'Project reference cannot be empty',
      },
      isMongoId: {
        errorMessage: 'Project reference should be a valid project ID',
      },
    },
  };