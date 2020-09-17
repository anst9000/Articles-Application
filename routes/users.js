const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { check, body, validationResult } = require('express-validator');

// Bring in User model
let User = require('../models/user');


// Register Form
router.get('/register', (req, res) => {
  res.render('register')
})


// Register Process
router.post('/register', [
  // Checking input fields
  check('name').isLength({ min: 1 }).withMessage('Name cannot be empty.'),
  check('email').isLength({ min: 1 }).withMessage('Email cannot be empty.'),
  body('email').isEmail().withMessage('You must enter a valid email address.'),
  check('username').isLength({ min: 1 }).withMessage('Username cannot be empty.'),
  check('password', 'invalid password')
    .isLength({ min: 4 })
    .custom((value, { req, loc, path }) => {
        if (value !== req.body.confirm) {
            // trow error if passwords do not match
            throw new Error('Passwords must match.');
        } else {
            return value;
        }
    })
],
(req, res) => {
  const { name, email, username, password, confirm } = req.body

    // Get Errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.render('register', {
      errors: errors.array()
    })
  } else {
    let newUser = new User({
      name,
      email,
      username,
      password
    })

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err)
        }

        newUser.password = hash
        newUser.save(err => {
          if (err) {
            console.log(err)
            return
          }

          req.flash('success', 'You are now registered and can log in.')
          res.redirect('/users/login')
        })
      })
    })
  }
})

// Login Form
router.get('/login', (req, res) => {
  res.render('login')
})


// Login Process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

// Logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success', 'You are now logged out.')
  res.redirect('/users/login')
})

module.exports = router;