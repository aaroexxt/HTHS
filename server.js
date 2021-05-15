const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const fetch = require('node-fetch');

app.use(express.static(path.join(__dirname, 'build')))

const cwd = __dirname;
const RequestHandler = require("./drivers/RequestHandler.js")

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

FLrouter.get("/searchOneWay/:origin/:destination/:date/:passengerCount", (req, res) => {
	let origin = req.params.origin;
	let destination = req.params.destination;
	let date = req.params.date;
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
			"cabin_class": "business"
		}
	}

	fetch("https://api.duffel.com/air/offer_requests", {
		method: "POST",
		headers: {
			"Accept-Encoding": "gzip",
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Duffel-Version": "beta",
			"Authorization": "Bearer test_ARZY49Q3c1MxWjF8ryh5ItJqJAaKnFs3EHVxVK0SDEt"
		},
		body: JSON.stringify(request)
	}).then(resp => resp.json()).then(resp => {
		return res.end(JSON.stringify(resp));
	})
})

FLrouter.get("/searchRoundtrip/:origin/:destination/:dateDeparture/:dateReturn/:passengerCount", (req, res) => {
	let origin = req.params.origin;
	let destination = req.params.destination;
	let dateD = req.params.dateDeparture;
	let dateR = req.params.dateReturn;
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
			"cabin_class": "business"
		}
	}

	fetch("https://api.duffel.com/air/offer_requests", {
		method: "POST",
		headers: {
			"Accept-Encoding": "gzip",
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Duffel-Version": "beta",
			"Authorization": "Bearer test_ARZY49Q3c1MxWjF8ryh5ItJqJAaKnFs3EHVxVK0SDEt"
		},
		body: JSON.stringify(request)
	}).then(resp => resp.json()).then(resp => {
		return res.end(JSON.stringify(resp));
	})
})


app.use("/api/map", MAProuter);
app.use("/api/flights", FLrouter);

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
