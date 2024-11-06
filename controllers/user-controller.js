const User = require('../models/user-model')
const Client = require('../models/client-model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {sendRegisterEmail} = require('../utility/nodemailer')

const usersController ={}

//Register a new user by admin 
usersController.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!['Project Manager', 'Animator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    const mailUser = await User.findOne({ email: req.body.email })
    if (mailUser) {
      sendRegisterEmail(mailUser.email, mailUser.name)
       //res.status(200).json({message:'Email sent successfully'})
    } else {
        return res.status(400).json({ errors: 'User not found' })
    }
    res.status(201).json({ message: 'User registered successfully',user });

  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message });
  }
};

// Register a new client
usersController.registerClient = async (req, res) => {
  const { name, email, password, contactInformation } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'Client',
      contactInformation,
    });
    await user.save();

        // Insert the new client into the clients collection
        const clientDoc = {
         _id: user._id,
          name: user.name,
          email: user.email,
          contactInformation: user.contactInformation || '',
          projectHistory: [],
          paymentHistory: [],
          feedback: [],
        };
        const client = new Client(clientDoc);
        await client.save();


    sendRegisterEmail(user.email, user.name);
    res.status(201).json({ message: 'Client registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




// Login a user
usersController.login = async (req, res) => {
  const { email, password } = req.body;
  try {

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const profile = {
      role: user.role,
      name: user.name,
      email: user.email,
     
    };
    const account = {
      userId: user._id,
      name: user.name,
      email: user.email,
   
    };
    res.json({ token,profile,account});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
usersController.getProfile = async (req, res) => {
  try {
    
    //console.log(`User ID from token: ${req.user.id}`); // Debug log
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
     return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



// Update user profile
usersController.updateProfile = async (req, res) => {
  const updates = req.body;
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  try {
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Function to get users by role
usersController.getUsersByRole = async (req, res) => {
  console.log('Full URL:', req.originalUrl);
  console.log('Query params:', req.query);

  // Ensure roles are provided
  if (!req.query.roles) {
      return res.status(400).json({ message: 'Roles query parameter is required' });
  }

  const { roles } = req.query;

  try {
      const rolesArray = roles.split(',');
      const users = await User.find({ role: { $in: rolesArray } }, 'name email role');
      res.json(users);
  } catch (error) {
      console.error('Error fetching users by role:', error);
      res.status(500).json({ error: 'Error fetching users by role' });
  }
}; 

// Get all users (Admin only)
usersController.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role')
    .select('-password')
    .populate('projectHistory')
    .populate({
      path: 'paymentHistory',
      select: 'status'
    })
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
usersController.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
     .select('-password')
      // .populate('projectHistory ')
      // .populate({
      //   path: 'paymentHistory',
      //   select: 'status'
      // })
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

usersController.getAnimators = async (req, res) => {
  try {
      const animators = await User.find({ role: 'Animator' }).select('_id name email');
      res.status(200).json(animators);
  } catch (error) {
      console.error('Error fetching animators:', error);
      res.status(500).json({ error: 'Failed to fetch animators' });
  }
};

// Delete a user (Admin only)
usersController.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = usersController
