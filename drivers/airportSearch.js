const fs = require("fs");
const path = require("path");
const {ratcliffObershelp} = require("./stringCompare.js");

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

const cutoff = 0.4;
const airportSearch = text => {
	text = text.toLowerCase();

	let bestMatch = [{}, 0];
	let found = false;
	for (let i=0; i<airports.length; i++) {
		let ap = airports[i];
		//icao or iata match exactly, good match
		if (ap.icao.toLowerCase() == text || ap.iata.toLowerCase() == text) {
			found = true;
			return ap;
		}

		let matchP = Math.max(
			(ap.name == "") ? 0 : ratcliffObershelp(ap.name, text),
			(ap.city == "") ? 0 : ratcliffObershelp(ap.city, text),
		);
		if (matchP > cutoff && matchP > bestMatch[1]) {
			found = true;
			bestMatch[0] = ap;
			bestMatch[1] = matchP;
		}
	}
	if (!found) return false;
	return bestMatch[0];
}

module.exports = {
	ICAOtoIATA: ICAOtoIATA,
	IATAtoICAO: IATAtoICAO,
	airportSearch: airportSearch
}
