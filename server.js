const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const fetch = require('node-fetch');

const cwd = __dirname;
const RequestHandler = require("./drivers/RequestHandler.js");
const asyncMiddleware = require("./drivers/asyncMiddleware.js");

const {ICAOtoIATA, IATAtoICAO, airportSearch} = require("./drivers/airportSearch.js");

const settings = require("./data/settings.json");

app.use(express.static(path.join(__dirname, 'build')))

let mapReady = false;
const mapUtils = require('./drivers/mapUtils.js');
mapUtils.init(cwd).then( () => {
	console.log("MAP INIT OK");
	mapReady = true; //set ready flag
}).catch( err => {
	console.error("Error initializing map: "+err);
	mapReady = false;
}); //initialize (async)

const MAProuter = express.Router();
//Map Routes
MAProuter.get("/ready", function(req, res) {
	console.log("Checking if map is ready: "+mapReady+", load%="+mapUtils.loadPercent+", load%Single="+mapUtils.loadPercentSingleFile);
	if (mapReady) {
		let tileLayersData = [];
		for (var i=0; i<mapUtils.mapAnnotationData.length; i++) { //compile the data
			tileLayersData.push(mapUtils.mapAnnotationData[i].settings);
		}
		return res.end(RequestHandler.SUCCESS(tileLayersData));
	} else {
		return res.end(RequestHandler.WAIT(mapUtils.loadPercent));
	}
});

MAProuter.get("/annotationTile/:layerIndex/:z/:x/:y", function(req, res) {
	let layer = req.params.layerIndex;
	let x = req.params.x;
	let y = req.params.y;
	let z = req.params.z; //zoom
	if (mapReady) {
		mapUtils.fetchAnnotationTile(layer, z, x, y)
		.then( tileData => {
			return res.end(RequestHandler.SUCCESS(tileData));
		})
		.catch( err => {
			console.error(err)
			return res.end(RequestHandler.FAILURE("TileData is null or undefined"));
		})
	} else {
		return res.end(RequestHandler.WAIT(mapUtils.loadPercent));
	}
});

const FLrouter = express.Router();

const currencyNameToSymbol = (name) => {
	switch (name) {
		case "USD":
			return "$";
			break;
		case "GBP":
			return "£";
			break;
		default: // unknown, just default
			return name;
			break;
	}
}

//TODO: this is a JANK HACK and really shouldn't work
const sanitizeAirportCode = code => {
	if (code.length == 3) return code
	let parsedAirport = ICAOtoIATA(code);
	if (parsedAirport == null || typeof parsedAirport == "undefined") {
		return code;
	} else {
		return parsedAirport;
	}

}

const dateFormat = dateStr => {
	let d = new Date(dateStr);

	var hours = d.getHours();
	var minutes = d.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return {time: strTime.toUpperCase(), date: d.toLocaleString().split(',')[0]}
}

const processFlightSearchResponse = (resp, roundTrip) => {
	/*
		Array of offer

		Each offer:
		DONE - Departure/arrival airport
		DONE - date & time of depart and arrive for each leg (and it's layover time)
		DONE - total time
		DONE - emissions
		DONE - cost
		DONE - airline
		DONE - class
		DONE - aircraft type
		- flight number
	 */
	let data = resp.data;

	let final = {};

	final.offers = [];

	for (let i=0; i<data.offers.length; i++) {
		let offer = data.offers[i];

		let finOffer = {};
		finOffer.airline = offer.owner.name;
		finOffer.isRoundTrip = roundTrip;
		finOffer.cost = currencyNameToSymbol(offer.total_currency)+offer.total_amount;
		finOffer.emissions = offer.total_emissions_kg;
		finOffer.seatClass = data.cabin_class;
		finOffer.legs = [];

		for (let j=0; j<offer.slices.length; j++) {
			let slice = offer.slices[j];

			let leg = {};
			leg.departureAirport = {
				name: slice.origin.name,
				iata: slice.origin.iata_code,
				icao: slice.origin.icao_code,
				lat: slice.origin.latitude,
				lon: slice.origin.longitude
			}
			leg.arrivalAirport = {
				name: slice.destination.name,
				iata: slice.destination.iata_code,
				icao: slice.destination.icao_code,
				lat: slice.destination.latitude,
				lon: slice.destination.longitude
			}

			let segment = slice.segments[0];

			leg.distance = Math.ceil(Number(segment.distance));
			let depFormat = dateFormat(segment.departing_at);
			let arrFormat = dateFormat(segment.arriving_at);
			leg.times = {
				total: slice.duration.substring(2).toLowerCase().split("h").join("h "),
				departureTime: depFormat.time,
				departureDate: depFormat.date,
				arrivalTime: arrFormat.time,
				arrivalDate: arrFormat.date

			}
			leg.planeType = segment.aircraft.name;
			leg.flightNumber = segment.operating_carrier_flight_number;

			finOffer.legs.push(leg);
		}

		final.offers.push(finOffer);

	}

	return final;
}

FLrouter.get("/searchOneway/:origin/:destination/:seatClass/:date/:passengerCount", asyncMiddleware(async (req, res, next) => {
	let origin = sanitizeAirportCode(req.params.origin);
	let destination = sanitizeAirportCode(req.params.destination);
	let date = req.params.date;
	let seatClass = req.params.seatClass;
	let pC = req.params.passengerCount;

	let passengers = [];
	for (let i=0; i<pC; i++) {
		passengers.push({"type": "adult"});
	}

	let request = {
		"data": {
			"slices": [
				{
					"origin": origin,
					"destination": destination,
					"departure_date": date
				}
			],
			"passengers": passengers,
			"cabin_class": seatClass
		}
	}

	fetch("https://api.duffel.com/air/offer_requests", {
		method: "POST",
		headers: {
			"Accept-Encoding": "gzip",
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Duffel-Version": "beta",
			"Authorization": "Bearer "+settings.duffelToken
		},
		body: JSON.stringify(request)
	}).then(resp => resp.json()).then(resp => {
		return res.end(JSON.stringify(processFlightSearchResponse(resp, false)));
	})
}));

FLrouter.get("/searchRoundtrip/:origin/:destination/:seatClass/:dateDeparture/:dateReturn/:passengerCount", asyncMiddleware(async (req, res, next) => {
	let origin = sanitizeAirportCode(req.params.origin);
	let destination = sanitizeAirportCode(req.params.destination);
	let dateD = req.params.dateDeparture;
	let dateR = req.params.dateReturn;
	let seatClass = req.params.seatClass;
	let pC = req.params.passengerCount;

	let passengers = [];
	for (let i=0; i<pC; i++) {
		passengers.push({"type": "adult"});
	}

	let request = {
		"data": {
			"slices": [
				{
					"origin": origin,
					"destination": destination,
					"departure_date": dateD
				},
				{
					"origin": destination,
					"destination": origin,
					"departure_date": dateR
				}
			],
			"passengers": passengers,
			"cabin_class": seatClass
		}
	}

	fetch("https://api.duffel.com/air/offer_requests", {
		method: "POST",
		headers: {
			"Accept-Encoding": "gzip",
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Duffel-Version": "beta",
			"Authorization": "Bearer "+settings.duffelToken
		},
		body: JSON.stringify(request)
	}).then(resp => resp.json()).then(resp => {
		return res.end(JSON.stringify(processFlightSearchResponse(resp, true)));
	})
}))

app.use("/api/map", MAProuter);
app.use("/api/flights", FLrouter);
app.get("/api/search/:text", (req, res) => {
	let search = airportSearch(req.params.text);

	if (search != null) {
		res.status(200);
		res.end(JSON.stringify(search));
	} else {
		res.end("Nothing found");
	}
})
app.use("/status", (req, res) => {
	return res.end("OK");
})

/*
API preference

base path: /api

/api/risk/lat/lon
/api/flight
/api/tile/x/y/z/zoom -> fetch OSM tile
 */

console.log("Starting server");
const port = process.env.PORT || 8080;

app.get('/api/hey', (req, res) => {
    return res.end("API WORKS POG");
});

const server = http.listen(port, () => {
  console.log('API is running on port', server.address().port);
});
