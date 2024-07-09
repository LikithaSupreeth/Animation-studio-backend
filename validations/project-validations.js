const projectValidationSchema = {
    name: {
      exists: {
        errorMessage: 'Project name is required',
      },
      notEmpty: {
        errorMessage: 'Project name cannot be empty',
      },
      trim: true,
    },
    description: {
      exists: {
        errorMessage: 'Project description is required',
      },
      notEmpty: {
        errorMessage: 'Project description cannot be empty',
      },
      trim: true,
    },
    deadline: {
      exists: {
        errorMessage: 'Project deadline is required',
      },
      notEmpty: {
        errorMessage: 'Project deadline cannot be empty',
      },
      isDate: {
        errorMessage: 'Project deadline should be a valid date',
      },
    },
    status: {
      exists: {
        errorMessage: 'Project status is required',
      },
      notEmpty: {
        errorMessage: 'Project status cannot be empty',
      },
      isIn: {
        options: [['Planned', 'In-Progress', 'Completed']],
        errorMessage: 'Project status should be one of "Planned", "In-Progress", or "Completed"',
      },
      trim: true,
    },
    assignedTeamMembers: {
      isArray: {
        errorMessage: 'Assigned team members should be an array',
      },
      custom: {
        options: (value) => {
          if (!Array.isArray(value) || value.some((item) => !mongoose.Types.ObjectId.isValid(item))) {
            throw new Error('Assigned team members should be valid user IDs');
          }
          return true;
        },
      },
    },
    client: {
      exists: {
        errorMessage: 'Client reference is required',
      },
      notEmpty: {
        errorMessage: 'Client reference cannot be empty',
      },
      isMongoId: {
        errorMessage: 'Client reference should be a valid client ID',
      },
    },
  };