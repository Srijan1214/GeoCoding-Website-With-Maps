
let passport = require('passport');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('login', { title: 'Final Project' });
});

router.get('/fail', function (req, res) {
	res.render('login_fail', {});
});

router.post('/',
	// This authenticate function is being called, and it generates
	// middleware that is used to do the authentication, using the 
	// strategy specified above.
	passport.authenticate('local', {
		successRedirect: '/contacts',
		failureRedirect: '/login/fail',
	})
);
module.exports = router;
