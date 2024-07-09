const paymentValidationSchema = {
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
    amount: {
      exists: {
        errorMessage: 'Amount is required',
      },
      notEmpty: {
        errorMessage: 'Amount cannot be empty',
      },
      isNumeric: {
        errorMessage: 'Amount must be a number',
      },
    },
    transactionDate: {
      exists: {
        errorMessage: 'Transaction date is required',
      },
      notEmpty: {
        errorMessage: 'Transaction date cannot be empty',
      },
      isDate: {
        errorMessage: 'Transaction date should be a valid date',
      },
    },
    status: {
      exists: {
        errorMessage: 'Status is required',
      },
      notEmpty: {
        errorMessage: 'Status cannot be empty',
      },
      isIn: {
        options: [['Pending', 'Completed']],
        errorMessage: 'Status should be one of "Pending" or "Completed"',
      },
    },
    invoiceNumber: {
      exists: {
        errorMessage: 'Invoice number is required',
      },
      notEmpty: {
        errorMessage: 'Invoice number cannot be empty',
      },
      trim: true,
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