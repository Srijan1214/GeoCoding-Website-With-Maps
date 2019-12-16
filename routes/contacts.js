var express = require('express');
var router = express.Router();
let mongoHandler = require('../public/javascripts/mongo');

let geo = require('mapbox-geocoding');
geo.setAccessToken('pk.eyJ1Ijoic3JpamFuMTIxNCIsImEiOiJjazMyazBkbDAwZGIxM21sYjF6NnVqbnAxIn0.jtPTRywpGF6mJ2ZRbtWJmw');

function ensureLoggedIn(req, res, next) {
	if (req.user) {
		next();
	}
	else {
		res.redirect("/login");
	}
}

/* GET home page. */
router.get('/',ensureLoggedIn, async function (req, res, next) {
	let obj = (await mongoHandler.getAllRecords());
	res.render('contacts', { arr: obj });
});

/* GET home page. */
router.post('/getAllRecords',ensureLoggedIn, async function (req, res, next) {
	let obj = (await mongoHandler.getAllRecords());
	console.log(obj);
	res.setHeader("Content-Type", "application/json");
	res.end(
		JSON.stringify({
			result: 'true',
			arr: obj
		})
	);
});

function getValidObject(req) {
	let obj = {};
	obj.id = '';
	if (req.body.radios) {
		obj.radio = req.body.radios;
	} else {
		obj.radio = '';
	}
	obj.firstName = req.body.first;
	obj.lastName = req.body.last;
	obj.street = req.body.street;
	obj.city = req.body.city;
	obj.state = req.body.state;
	if (!(obj.state)) {
		obj.state = '';
	}
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
	return obj;
}

router.post('/delete',ensureLoggedIn,async function (req, res, next) {
	result = 'success';
	res.setHeader("Content-Type", "application/json");
	await mongoHandler.removeRecord(req.body.id);
	res.end(
		JSON.stringify({
			result: result
		})
	);
});

router.post('/update', ensureLoggedIn,async function (req, res, next) {
	let obj = getValidObject(req);
	delete obj.id;

	// Geocode an address to coordinates
	geo.geocode('mapbox.places', obj.street + ' ' + obj.state + ' ' + obj.zip, async function (err, geoData) {
		let latitude;
		let longitude;
		if (geoData.features[0]) {
			latitude = geoData.features[0].center[1];	//geoData.features[0] gets first return value out of many possibilities
			longitude = geoData.features[0].center[0];	//geoData.features[0] gets first return value out of many possibilities
		}
		obj.latitude = latitude;
		obj.longitude = longitude;

		console.log(obj);

		let result = await (mongoHandler.updateRecord(req.body.hiddenField, obj));

		obj = Object.assign({ _id: req.body.hiddenField }, obj);
		res.setHeader("Content-Type", "application/json");
		res.end(
			JSON.stringify({
				result: result.acknowledged,
				obj: obj
			})
		);
	});
});

router.post('/create', ensureLoggedIn,function (req, res, next) {
	let obj = getValidObject(req);
	delete obj.id;

	console.log(obj);

	// Geocode an address to coordinates
	geo.geocode('mapbox.places', obj.street + ' ' + obj.state + ' ' + obj.zip, async function (err, geoData) {
		let latitude = '';
		let longitude = '';
		if (geoData.features[0]) {
			latitude = geoData.features[0].center[1];	//geoData.features[0] gets first return value out of many possibilities
			longitude = geoData.features[0].center[0];	//geoData.features[0] gets first return value out of many possibilities
		}
		console.log(latitude);
		console.log(longitude);
		obj.latitude = latitude;
		obj.longitude = longitude;

		let id = (await mongoHandler.AddRecord(obj)).insertedId;

		obj = Object.assign({ _id: req.body.hiddenField }, obj);
		console.log(obj);

		result = 'true';
		res.setHeader("Content-Type", "application/json");
		res.end(
			JSON.stringify({
				result: result,
				obj: obj
			})
		);
	});
});

module.exports = router;
