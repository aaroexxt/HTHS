const fs = require("fs");
const path = require("path");

const airports = JSON.parse(fs.readFileSync(path.join(process.cwd(), "/data/airports.json")));

const ICAOtoIATA = icao => {
	for (let i=0; i<airports.length; i++) {
		let airport = airports[i];
		if (airport.icao == icao) {
			return airport.iata;
		}
	}

	return null;
}

const IATAtoICAO = iata => {
	for (let i=0; i<airports.length; i++) {
		let airport = airports[i];
		if (airport.iata == iata) {
			return airport.icao;
		}
	}

	return null;
}

module.exports = {
	ICAOtoIATA: ICAOtoIATA,
	IATAtoICAO: IATAtoICAO
}
