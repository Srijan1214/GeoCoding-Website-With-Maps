var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let bcrypt = require("bcryptjs");
let session = require('express-session');

var indexRouter = require('./routes/index');
let mailerRouter = require('./routes/mailer');
let contactsRouter = require('./routes/contacts');
let loginRouter = require('./routes/login');

let mongoHandler = require('./public/javascripts/mongo');

var app = express();


let username = "cmps369";
let password = "finalproject";

//genSalt is creating a random salt value, which is then used in the callback to set a hashed password.
bcrypt.genSalt(10, function (err, salt) {
	console.log(`Salt generated = ${salt}`);


	bcrypt.hash(password, salt, function (err, hash) {
		// The global password value is now reset to the hashed version.
		password = hash;
		console.log(`Hashed salt/password = ${password}`);

	});
});

// Note, I hashed the password "password" and stored it here.  In a system that allowed users to register,
// the user would type a plain text password ("password") and your code would hash it and store in a database.



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'cmps369'}))
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password'
},
	function (user, pswd, done) {
		if (user != username) {
			console.log("Username mismatch");
			return done(null, false);
		}

		// Remember:
		// - pswd is the plain text password the user just entered to try to login.
		// - password is actually salt/hash(salt+password) - so the bcrypt library 
		// - extracts the salt value from "password", hashes salt+pswd, and compares against
		// - provided hash.
		bcrypt.compare(pswd, password, function (err, isMatch) {
			if (err) return done(err);
			if (!isMatch) {
				console.log("Password mismatch");
			}
			else {
				console.log("Valid credentials");
			}
			done(null, isMatch);
		});
	}
));

passport.serializeUser(function (username, done) {
	// this is called when the user object associated with the session
	// needs to be turned into a string.  Since we are only storing the user
	// as a string - just return the username.
	done(null, username);
});

passport.deserializeUser(function (username, done) {
	// normally we would find the user in the database and
	// return an object representing the user (for example, an object
	// that also includes first and last name, email, etc)
	done(null, username);
});


app.use('/login', loginRouter);
app.use('/', indexRouter);
app.use('/mailer', mailerRouter);
app.use('/contacts', contactsRouter);


	// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

mongoHandler.startConnection();

module.exports = app;
