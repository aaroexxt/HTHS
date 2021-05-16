const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const fetch = require('node-fetch');
const csv = require('csv-parser');
const fs = require('fs');

const cwd = __dirname;
const RequestHandler = require("./drivers/RequestHandler.js");
const asyncMiddleware = require("./drivers/asyncMiddleware.js");

const {ICAOtoIATA, IATAtoICAO, airportSearch} = require("./drivers/airportSearch.js");
const countries = JSON.parse(fs.readFileSync("./data/countries.json"));
const stripBom = require('strip-bom-stream');
const {ratcliffObershelp, levenshtein} = require("./drivers/stringCompare.js");

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
		Array of offers

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
				lon: slice.origin.longitude,
				risk: airportRiskCache(slice.origin.icao_code)
			}
			leg.arrivalAirport = {
				name: slice.destination.name,
				iata: slice.destination.iata_code,
				icao: slice.destination.icao_code,
				lat: slice.destination.latitude,
				lon: slice.destination.longitude,
				risk: airportRiskCache(slice.destination.icao_code)
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

app.get("/api/search/:text", (req, res) => {
	let search = airportSearch(req.params.text);

	if (search != null) {
		res.status(200);
		res.end(JSON.stringify(search));
	} else {
		res.end("Nothing found");
	}
})

var covidData = [];
let covidDataReady = false;
fs.createReadStream(path.join(process.cwd(),settings.covidDatapath))
	.pipe(stripBom())
	.pipe(csv())
	.on('data', (data) => covidData.push(data))
	.on('end', () => {
		covidDataReady = true;
		console.log("DATALOAD: covid");
	});

var homicideData = [];
let homicideDataReady = false;
fs.createReadStream(path.join(process.cwd(),settings.homicideDatapath))
	.pipe(stripBom())
	.pipe(csv({ separator: ',' }))
	.on('data', (data) => homicideData.push(data))
	.on('end', () => {
		homicideDataReady = true;
		console.log("DATALOAD: homicides");
	});

var corruptionData = [];
let corruptionDataReady = false;
fs.createReadStream(path.join(process.cwd(),settings.corruptionDatapath))
	.pipe(stripBom())
	.pipe(csv({ separator: ',' }))
	.on('data', (data) => corruptionData.push(data))
	.on('end', () => {
		corruptionDataReady = true;
		console.log("DATALOAD: corruption");
	});

//This is also a jank hack pls fix :(
const expandCountry = country => {
	if (country.length == 2) {
		for (let i=0; i<countries.length; i++) {
			let cTest = countries[i];
			if (cTest.code == country) {
				return cTest.name;
			}
		}
	}
	return country;
}

const threshold = 0.6;
const hBounds = [2001, 2016];
const getHomicideData = (country) => {
	country = expandCountry(country);
	let bestMatch = [0, {}]
	for (let i=0; i<homicideData.length; i++) {
		let matchV = ratcliffObershelp(homicideData[i]["UNODC Name"], country);
		if (matchV > bestMatch[0]) {
			bestMatch[0] = matchV;
			bestMatch[1] = homicideData[i];
		}
	}

	if (bestMatch[0] > threshold) {
		for (let j=hBounds[1]; j>=hBounds[0]; j++) {
			let dataT = String(bestMatch[1][j]).replace(/^\s+|\s+$/g, ''); //strip extra chars
			if (!isNaN(Number(dataT))) {
				return dataT;
			}
		}
	}
	return null;
}

const getCorruptionData = (country) => {
	country = expandCountry(country);
	let bestMatch = [0, {}]
	for (let i=0; i<corruptionData.length; i++) {
		let matchV = ratcliffObershelp(corruptionData[i]["Country"], country);
		if (matchV > bestMatch[0]) {
			bestMatch[0] = matchV;
			bestMatch[1] = corruptionData[i];
		}
	}

	if (bestMatch[0] > threshold) {
		let dataT = String(bestMatch[1]["CPI2015"]).replace(/^\s+|\s+$/g, ''); //strip extra chars
		if (!isNaN(Number(dataT))) {
			return 100-dataT;
		}
	}
	return null;
}

const getCovidData = (country, city, state) => {
	country = expandCountry(country);
	let matches = [];
	for (let i=0; i<covidData.length; i++) {
		let r = covidData[i];
		//PEOPLE_POSITIVE_CASES_COUNT,COUNTY_NAME,PROVINCE_STATE_NAME,REPORT_DATE,CONTINENT_NAME,DATA_SOURCE_NAME,PEOPLE_DEATH_NEW_COUNT,COUNTY_FIPS_NUMBER,COUNTRY_ALPHA_3_CODE,COUNTRY_SHORT_NAME,COUNTRY_ALPHA_2_CODE,PEOPLE_POSITIVE_NEW_CASES_COUNT,PEOPLE_DEATH_COUNT
		//0,Clarke,Alabama,2020-01-21,America,New York Times,0,01025,USA,United States,US,0,0
		let date = r["REPORT_DATE"];
		let cName = r["COUNTRY_SHORT_NAME"];
		let citName = r["COUNTY_NAME"];
		let statName = r["PROVINCE_STATE_NAME"];
		let cases = r["PEOPLE_POSITIVE_CASES_COUNT"];

		let matchV = ratcliffObershelp(cName, country);
		if (matchV > threshold) {
			let nMatchV = 0;
			nMatchV += ratcliffObershelp(citName, city);
			nMatchV += ratcliffObershelp(statName, state);
			nMatchV /= 2;
			if (nMatchV > threshold) {
				matches.push(r);
			}
		}
	}

	let newestData = [0, {}];
	for (let i=0; i<matches.length; i++) {
		let time = new Date(matches[i]["REPORT_DATE"]).getTime();
		if (time > newestData[0]) {
			newestData[0] = time;
			newestData[1] = matches[i];
		}
	}

	if (newestData[0] == 0) {
		return null;
	} else {
		return newestData[1]["PEOPLE_POSITIVE_CASES_COUNT"];
	}
}

app.get("/api/risk/:country/:city/:state", (req, res) => {
	let city = req.params.city || "";
	let state = req.params.state || "";
	let country = req.params.country;

	let homicideRisk = homicideDataReady ? getHomicideData(country) : 100;
	let corruptionRisk = corruptionDataReady ? getCorruptionData(country) : 100;
	let covidRisk = covidDataReady ? getCovidData(country, city, state)/1000 : 100;

	return res.end(JSON.stringify({
		homicide: homicideRisk,
		corruption: corruptionRisk,
		covidRisk: covidRisk
	}));
})

var airportCache = [];
const airportRiskCache = icao => {
	let hitCache = false;
	for (let i=0; i<airportCache.length; i++) {
		if (airportCache[i][0] == icao) {
			hitCache = true;
			console.log("hit")
			return airportCache[i][1];
		}
	}
	console.log("noHit")
	if (!hitCache) {
		let risk = airportRisk(icao);
		airportCache.push([icao, risk]);
		return risk;
	}
}
const airportRisk = icao => {
	let search = airportSearch(icao);

	if (search != null) {
		let city = search.city || "";
		let state = search.subd || "";
		let country = search.country || "";

		let homicideRisk = homicideDataReady ? getHomicideData(country) : 100;
		let corruptionRisk = corruptionDataReady ? getCorruptionData(country) : 100;
		let covidRisk = covidDataReady ? getCovidData(country, city, state)/1000 : 100;

		return JSON.stringify({
			homicide: homicideRisk,
			corruption: corruptionRisk,
			covidRisk: covidRisk
		});
	}
}

app.get("/api/risk/airport/:icao", (req, res) => {
	return res.end(airportRiskCache(sanitizeAirportCode(req.params.icao)))
})

app.use("/api/map", MAProuter);
app.use("/api/flights", FLrouter);
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
