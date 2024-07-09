const userLoginValidationSchema = {
    email: {
        exists: {
            errorMessage: 'Email is required'
            
        },
        notEmpty: {
            errorMessage: 'Email cannot be empty'
        },
        isEmail: {
            errorMessage: 'Email should be a valid format'
        },
        trim: true,
        normalizeEmail: true
    },
    password: {
        exists: {
            errorMessage: 'Password is required'
        },
        notEmpty: {
            errorMessage: 'Password cannot be empty'
        },
        isLength: {
            options: { min: 8, max: 128 },
            errorMessage: 'Password should be between 8 - 128 characters'
        },
        trim: true
    }
};

module.exports = userLoginValidationSchema;
