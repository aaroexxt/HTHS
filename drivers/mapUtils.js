const geojsonVT = require("geojson-vt"); //thanks the gods to https://github.com/mapbox/geojson-vt for this AWESOME library
const fs = require("fs");
const path = require("path");
const bigJson = require('big-json');

const mapAnnotationFiles = [
	{"file": "/state.geo.json", "strokeColor": "#F00000", "fillColor": "#1EB300", "opacity": 1, "strokeWeight": 2}
]

const mapUtils = {
	mapAnnotationData: [],
	debugMode: false,
	init: (cwd) => {
		return new Promise( (resolve, reject) => {
			function loadAnnotationData(index) {
				let mdr = path.join(cwd,"data",mapAnnotationFiles[index].file);
				if (mapUtils.debugMode) {
					console.log("Fetching mapdata (index: "+index+") via read stream from dir: "+mdr);
				}

				if (!fs.existsSync(mdr)) {
					return reject("Map file at index: "+index+" and path: "+mdr+"does not exist, check settings");
				} else if (typeof mapAnnotationFiles[index].file == "undefined" || typeof mapAnnotationFiles[index].fillColor == "undefined" || typeof mapAnnotationFiles[index].strokeColor == "undefined" || typeof mapAnnotationFiles[index].opacity == "undefined" || typeof mapAnnotationFiles[index].strokeWeight == "undefined") {
					return reject("Settings file at index: "+index+" has invalid settings (missing file, strokeColor, or fillColor, or strokeWeight or opacity)")
				}

				let readStream = fs.createReadStream(mdr);
				let parseStream = bigJson.createParseStream(); //parse stream for json

				let procSize = 0;
				let totalSize;
				fs.stat(mdr, function (err, stats) {
					if (err) {
						return reject("Error getting size of map file");
					} else {
						totalSize = stats.size;
					}
				});

				readStream.on('data', function(buffer) {
			        let segmentLength = buffer.length;
			        // Increment the uploaded data counter
			        procSize += segmentLength;

			        // Display the upload percentage
			        mapUtils.loadPercentSingleFile = Number((procSize/totalSize*100).toFixed(2));
			        mapUtils.loadPercent = Number((((index/mapAnnotationFiles.length)+((procSize/totalSize)/mapAnnotationFiles.length))*100).toFixed(2)); //upload percentage of all files
			    });

				parseStream.on('data', gdc => {
					if (mapUtils.debugMode) {
						console.log("Mapping: loaded geoJson data for file at index: "+index+", running tile preprocessor...");
					}
					let tileIndex = geojsonVT(gdc, { //create tile index
						debug: ((mapUtils.debugMode)?2:0),
						maxZoom: 15,
						indexMaxZoom: 13
					});

					mapUtils.mapAnnotationData.push({
						tileIndex: tileIndex,
						fileSize: totalSize,
						settings: {
							index: index,
							strokeColor: mapAnnotationFiles[index].strokeColor,
							fillColor: mapAnnotationFiles[index].fillColor,
							opacity: mapAnnotationFiles[index].opacity,
							strokeWeight: mapAnnotationFiles[index].strokeWeight,
						}
					}) //push the full object
					if (mapUtils.debugMode) {
						console.log("Tile preprocessor created successfully for data at index: "+index);
					}

					readStream.unpipe(parseStream); //unpipe stream

					if (index >= mapAnnotationFiles.length-1) {
						if (mapUtils.debugMode) {
							console.log("Done loading mapdata");
						}
						return resolve();
					} else {
						loadAnnotationData(index+1); //load next index
					}
				})
				readStream.pipe(parseStream);
			}

			//ACTUAL INIT CODE
			if (mapUtils.debugMode) {
				console.log("starting geojson load...");
			}

			loadAnnotationData(0); //start load process for annotation geojson
		})
	},
	fetchAnnotationTile: (layerIndex, zoom, x, y) => {
		return new Promise( (resolve, reject) => {
			let realLindex = -1;
			for (var i=0; i<mapUtils.mapAnnotationData.length; i++) { //search it up just in case
				if (mapUtils.mapAnnotationData[i].settings.index == layerIndex) {
					realLindex = i;
					break;
				}
			}
			if (mapUtils.debugMode) {
				console.log("Fetching annotationTile (layer="+layerIndex+") @x="+x+" y="+y+" zoom="+zoom);
			}
			if (realLindex < 0) {
				console.warn("Tried to lookup layer "+layerIndex+" but couldn't find it for some reason??");
				return reject("Layer lookup failed");
			} else {
				let tileData = mapUtils.mapAnnotationData[realLindex].tileIndex.getTile(Number(zoom), Number(x), Number(y)); //return the cache from the correct layer
				if (typeof tileData == "undefined" || tileData === null || !tileData) {
					if (mapUtils.debugMode) {
						console.warn("TileData is null or undefined");
					}
					return reject();
				} else {
					return resolve(tileData.features);
				}
			}
		})
	}

}


module.exports = mapUtils;
