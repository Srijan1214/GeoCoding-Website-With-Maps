var express = require('express');
let mongoHandler = require('../public/javascripts/mongo');
let geo = require('mapbox-geocoding');

var router = express.Router();

geo.setAccessToken('pk.eyJ1Ijoic3JpamFuMTIxNCIsImEiOiJjazMyazBkbDAwZGIxM21sYjF6NnVqbnAxIn0.jtPTRywpGF6mJ2ZRbtWJmw');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('mailer');
});

router.post('/', function (req, res, next) {
	let obj = {};
	obj.radio = req.body.radios;
	obj.firstName = req.body.first;
	obj.lastName = req.body.last;
	obj.street = req.body.street;
	obj.city=req.body.city;
	obj.state = req.body.state;
	obj.zip = req.body.zip;
	if (req.body.chkbx4 == "any") {
		obj.phone = req.body.phone;
		obj.mail = "Yes";
		obj.email = req.body.email;
	} else {
		if (req.body.chkbx1 == "phone") {
			obj.phone = req.body.phone;
		} else {
			obj.phone = "No";
		}
		if (req.body.chkbx2 == "mail") {
			obj.mail = "Yes";
		} else {
			obj.mail = "No";
		}
		if (req.body.chkbx3 == "email") {
			obj.email = req.body.email;
		} else {
			obj.email = "No";
		}
	}

	console.log(obj);
	// Geocode an address to coordinates
	geo.geocode('mapbox.places', req.body.street + ' ' + req.body.state + ' ' + req.body.zip,async function (err, geoData) {
		let latitude;
		let longitude;
		latitude = geoData.features[0].center[1];	//geoData.features[0] gets first return value out of many possibilities
		longitude = geoData.features[0].center[0];	//geoData.features[0] gets first return value out of many possibilities
		console.log(latitude);
		console.log(longitude);
		obj.latitude = latitude;
		obj.longitude = longitude;

		await mongoHandler.AddRecord(obj);	
		res.render('part2', obj);
	});


});

module.exports = router;



