const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

// Connect to DB
mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
let db = mongoose.connection;

// Check connection
db.once('open', () => {
  console.log('Connected to DB')
})

// Check for DB errors
db.on('error', (err) => {
  console.log(err)
})

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));


// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))


// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Set public folder
app.use(express.static(path.join(__dirname, 'public')))

// Bring in models
let Article = require('./models/article');

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')


// Passport Config
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null
  next()
})

app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles
      })
    }
  })
})


// Route Files
let articles = require('./routes/articles')
app.use('/articles', articles)
let users = require('./routes/users')
app.use('/users', users)

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
