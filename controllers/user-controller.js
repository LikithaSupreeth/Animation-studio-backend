const User = require('../models/user-model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {sendRegisterEmail} = require('../utility/nodemailer')

const usersController ={}

//Register a new user
usersController.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
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




// Login a user
usersController.login = async (req, res) => {
  const { email, password } = req.body;
  try {

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
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

// Get all users (Admin only)
usersController.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
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
