const taskValidationSchema = {
    name: {
      exists: {
        errorMessage: 'Task name is required',
      },
      notEmpty: {
        errorMessage: 'Task name cannot be empty',
      },
      trim: true,
    },
    description: {
      exists: {
        errorMessage: 'Task description is required',
      },
      notEmpty: {
        errorMessage: 'Task description cannot be empty',
      },
      trim: true,
    },
    dueDate: {
      exists: {
        errorMessage: 'Due date is required',
      },
      notEmpty: {
        errorMessage: 'Due date cannot be empty',
      },
      isDate: {
        errorMessage: 'Due date should be a valid date',
      },
    },
    status: {
      exists: {
        errorMessage: 'Task status is required',
      },
      notEmpty: {
        errorMessage: 'Task status cannot be empty',
      },
      isIn: {
        options: [['Not Started', 'In Progress', 'Completed']],
        errorMessage: 'Task status should be one of "Not Started", "In Progress", or "Completed"',
      },
      trim: true,
    },
    assignedAnimator: {
      exists: {
        errorMessage: 'Assigned animator is required',
      },
      notEmpty: {
        errorMessage: 'Assigned animator cannot be empty',
      },
      isMongoId: {
        errorMessage: 'Assigned animator should be a valid user ID',
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

  const taskUpdateValidationSchema = {
    name: {
        optional: true,
        exists: {
            errorMessage: 'Task name is required',
        },
        notEmpty: {
            errorMessage: 'Task name cannot be empty',
        },
        trim: true,
    },
    description: {
        optional: true,
        exists: {
            errorMessage: 'Task description is required',
        },
        notEmpty: {
            errorMessage: 'Task description cannot be empty',
        },
        trim: true,
    },
    dueDate: {
        optional: true,
        exists: {
            errorMessage: 'Due date is required',
        },
        notEmpty: {
            errorMessage: 'Due date cannot be empty',
        },
        isDate: {
            errorMessage: 'Due date should be a valid date',
        },
    },
    status: {
        optional: true,
        exists: {
            errorMessage: 'Task status is required',
        },
        notEmpty: {
            errorMessage: 'Task status cannot be empty',
        },
        isIn: {
            options: [['Not Started', 'In Progress', 'Completed']],
            errorMessage: 'Task status should be one of "Not Started", "In Progress", or "Completed"',
        },
        trim: true,
    },
    assignedAnimator: {
        optional: true,
        exists: {
            errorMessage: 'Assigned animator is required',
        },
        notEmpty: {
            errorMessage: 'Assigned animator cannot be empty',
        },
        isMongoId: {
            errorMessage: 'Assigned animator should be a valid user ID',
        },
    },
    project: {
        optional: true,
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
  
module.exports = {taskValidationSchema,taskUpdateValidationSchema};
  