const express = require('express');
const router = express.Router();
const multer = require('multer');
const User= require('../Model/User');
const jwt = require('jsonwebtoken');

const secretKey = 'your_jwt_secret';


const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Sorry !! You are not authorized ' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    req.user.role = decoded.userType;
    next();
  });
};


const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
//For register
router.post('/api/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).send({ message: 'User with this email already exists' });
    }
    const newUser = new User(req.body);
    await newUser.save();
    res.status(200).send({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).send({ message: 'Error registering user' });
  }
});

//ForLogin
router.post('/api/login', async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user && user.password === req.body.password && user.isActive) {
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      req.session.user = {
        _id: user._id,
        email: user.email,
        userType: user.type,
        fullName: user.fullName,
        isActive: user.isActive
      };
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          userType: user.type,
          isActive: user.isActive
        },
        'your_jwt_secret',
        { expiresIn: '1h' }
      );
      const responseData = { ...user._doc, token };
      delete responseData.password;
      res.json(responseData);
    } else {
      if (user && !user.isActive) {
        res.status(403).send('Your account is not active. Please contact support.');
      } else {
        res.status(403).send('Error with username/password or account status.');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

//ForLogout
router.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error on logout', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully' });
  });
});

 //ToGet All Users
router.get('/api/users', verifyToken, checkRole(['admin']), (req, res) => {
  const userIdInSession = req.session.user?._id;
  if (!userIdInSession) {
    return res.status(401).send({ message: 'No user logged in' });
  }
  User.find({ _id: { $ne: userIdInSession } })
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

//Delete User By ID
router.delete('/api/users/:id', (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json('User deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update User Role
router.patch('/api/users/:id/role', (req, res) => {
  User.findByIdAndUpdate(req.params.id, { type: req.body.type }, { new: true })
    .then(updatedUser => res.json(updatedUser))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update User Active Status
router.patch('/api/users/:id/status', (req, res) => {
  User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true })
    .then(updatedUser => res.json(updatedUser))
    .catch(err => res.status(400).json('Error: ' + err));
});

//chnage userpassword from  admin
router.patch('/api/users/:id/change-password', (req, res) => {
  const { newPassword } = req.body;
  const userId = req.params.id;
  User.findByIdAndUpdate(userId, { password:newPassword }, { new: true })
    .then(user => res.json({ message: 'Password updated successfully' }))
    .catch(err => res.status(400).json('Error: ' + err));
});

//Update User details
router.patch('/api/users/:id',async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).send({ message: 'Error updating user', error: error.message });
  }
});

//Get details of currentuser
router.get('/api/currentUser', async (req, res) => {
  if (req.session && req.session.user && req.session.user._id) {
    try {
      const user = await User.findById(req.session.user._id);
      if (user) {
        const userData = {
          _id: user._id,
          email: user.email,
          userType: user.type,
          fullName: user.fullName,
          address: user.address,
          phone: user.phone,
          password:user.password
        };
        res.json(userData);
      } else {
        res.status(404).send({ message: 'User not found' });
      }
    } catch (error) {
      console.error("Database query failed:", error);
      res.status(500).send({ message: 'Failed to retrieve user details', error: error.message });
    }
  } else {
    res.status(401).send({ message: 'No user is currently logged in' });
  }
});

module.exports = router;
