require("dotenv").config();
const express = require("express");
const configureDB = require("./config/db");
const {checkSchema,validationResult} = require('express-validator')

const authenticateUser = require('./middlewares/authenticate-user')
const authorizeUser = require('./middlewares/authorize-user')

const {userRegisterValidationSchema,userUpdateValidations} = require('./validations/user-register-validations')
const userLoginValidationSchema = require('./validations/user-login-validations')
const projectValidationSchema = require('./validations/project-validations')
const taskValidationSchema = require('./validations/task-validations')
const fileValidationSchema = require('./validations/file-validation')
const paymentValidationSchema = require('./validations/payment-validation')
const clientValidationSchema= require('./validations/client-validations')
 


const usersController = require('./controllers/user-controller')
const taskController = require('./controllers/task-controller')
const projectController = require('./controllers/project-controller')
const paymentController= require('./controllers/payment-controller')
const clientController=require('./controllers/client-controller')
const fileController=require('./controllers/file-controller')

const app = express();
const port = process.env.PORT;
configureDB();

app.use(express.json());

// application level middleware - using it for logging request for debug purpose
app.use(function(req, res, next){
    console.log(`${req.ip} - ${req.method} - ${req.url} - ${new Date()}`)
    next()
})

// Function to handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

//user crud operations
app.post('/users/register',checkSchema(userRegisterValidationSchema),handleValidation,usersController.register)
app.post('/users/login',checkSchema(userLoginValidationSchema),handleValidation,usersController.login)
app.get('/users/getuser',authenticateUser,usersController.getProfile)
app.get('/users/getbyid/:id',authenticateUser,authorizeUser(['Admin']),usersController.getUserById)
app.get('/users/getallusers',authenticateUser,authorizeUser(['Admin']),usersController.getAllUsers)
app.put('/users/update',authenticateUser,checkSchema(userUpdateValidations),usersController.updateProfile)
app.delete('/users/:id', authenticateUser, authorizeUser(['Admin']), usersController.deleteUser);

//project crud operations
app.post('/project/create', authenticateUser, authorizeUser(['Admin', 'Project Manager']), checkSchema(projectValidationSchema), handleValidation, projectController.createProject);
app.get('/project/get/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager','Animator']),projectController.getProject);
app.get('/project/getallprojects', authenticateUser, authorizeUser(['Admin', 'Project Manager','Animator']),projectController.getAllProjects);
app.put('/project/update/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), checkSchema(projectValidationSchema), handleValidation, projectController.updateProject);
app.delete('/project/delete/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), projectController.deleteProject);

//task crud operations
app.post('/task/create',authenticateUser,authorizeUser(['Admin','Project manager']),checkSchema(taskValidationSchema),handleValidation,taskController.createTask)
app.get('/task/gettaskbyid/:id', authenticateUser,authorizeUser(['Admin', 'Project Manager','Animator']), taskController.getTask);
app.get('/task/getalltasks',authenticateUser,authorizeUser(['Admin', 'Project Manager','Animator']))
app.put('/task/update/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), checkSchema(taskValidationSchema), handleValidation, taskController.updateTask);
app.delete('/task/delete/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), taskController.deleteTask);

//client crud operations
app.post('/client/create', authenticateUser, authorizeUser(['Admin', 'Project Manager']), checkSchema(clientValidationSchema), handleValidation, clientController.createClient);
app.get('/client/getclient/:id', authenticateUser, clientController.getClient);
app.put('/client/update/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), checkSchema(clientValidationSchema), handleValidation, clientController.updateClient);
app.delete('/client/delete/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), clientController.deleteClient);

//file crud operations 
app.post('/file/create', authenticateUser, authorizeUser(['Admin', 'Project Manager']), checkSchema(fileValidationSchema), handleValidation, fileController.uploadFile);
app.get('/file/get/:id', authenticateUser, fileController.getFile);
app.put('/file/update/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), checkSchema(fileValidationSchema), handleValidation, fileController.updateFile);
app.delete('/file/delete/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), fileController.deleteFile);

//payment crud operations
app.post('/payment/create', authenticateUser, authorizeUser(['Admin', 'Project Manager']), checkSchema(paymentValidationSchema), handleValidation, paymentController.createPayment);
app.get('/payment/get/:id', authenticateUser, paymentController.getPayment);
app.put('/payment/update/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), checkSchema(paymentValidationSchema), handleValidation, paymentController.updatePayment);
app.delete('/payment/delete/:id', authenticateUser, authorizeUser(['Admin', 'Project Manager']), paymentController.deletePayment);


app.listen(port, () => {
  console.log("server is running on port", port);
});