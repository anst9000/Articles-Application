const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Bring in Article and User model
let Article = require('../models/article');
let User = require('../models/user');


// Add route
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article', {
    title: 'Articles'
  })
})

// Add Submit POST route
router.post('/add', [
  // title must be at least 1 char long
  body('title').isLength({ min: 1  }).withMessage('Title cannot be empty.'),
  // body must be at least 5 chars long
  body('body').isLength({ min: 10 }).withMessage('Body must be at least 10 characters.')
],
(req, res) => {
  // Get Errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.render('add_article', {
      title: 'Add Article',
      errors: errors.array()
    })
  } else {
    let article = new Article()
    const { title, body } = req.body
    article.title = title
    article.author = req.user._id
    article.body = body

    article.save((err) => {
      if (err) {
        console.log(err);
        return
      }

      req.flash('success', 'Article Added')
      res.redirect('/')
    })
  }
})

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash('danger', 'Not authorized')
      res.redirect('/')
    } else {
      res.render('edit_article', {
        title: 'Edit Article',
        article
      })
    }
  })
})

// Edit Submit POST route
router.post('/edit/:id', [
  // title must be at least 1 char long
  body('title').isLength({ min: 1  }).withMessage('Title cannot be empty.'),
  // author must be at least 1 char long
  body('author').isLength({ min: 2 }).withMessage('Author must be at least 2 characters.'),
  // body must be at least 5 chars long
  body('body').isLength({ min: 10 }).withMessage('Body must be at least 10 characters.')
],
(req, res) => {
  // Get Errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    Article.findById(req.params.id, (err, article) => {
    res.render('article', {
      article,
      errors: errors.array()
    })
  })
  } else {
    let article = {}
    const { title, author, body } = req.body
    article.title = title
    article.author = author
    article.body = body

    let query = { _id: req.params.id }

    Article.updateOne(query, article, (err) => {
      if (err) {
        console.log(err);
        return
      }

      req.flash('success', 'Article Updated');
      res.redirect('/')
    })
  }
})


router.delete('/:id', (req, res) => {
  if (!req.user._id) {
    res.status(500).send()
  }

  let query = { _id: req.params.id }

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send()
    } else {
      Article.deleteOne(query, (err) => {
        if (err) {
          console.log(err)
        } else {
          res.send('Success.')
        }
      })
    }
  })
})



// Get single article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        article,
        author: user.name
      })
    })
  })
})

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    req.flash('danger', 'Please login.')
    res.redirect('/users/login')
  }
}

module.exports = router;
