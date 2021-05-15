const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);

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

FLrouter.get("/search/:origin/:destination/:passengerCount", (req, res) => {
	let origin = req.params.origin;
	let destination = req.params.destination;
	let pC = req.params;
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
