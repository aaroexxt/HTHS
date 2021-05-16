import logo from './logo.svg';
import './App.css';
import React from 'react';
import PropTypes from 'prop-types';

import NavHeader from "./NavHeader.jsx";
import InfoBlock from "./InfoBlock.jsx";
import RecordReturn from "./RecordReturn.jsx";
import SearchResult from "./SearchResult.jsx";
import MainMap from "./MainMap.jsx"
import mutateState from "./mutateState.jsx";

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

const midPoint = (lat1,lon1,lat2,lon2) => {
	function toRadians(degress) {
    return degress * (Math.PI / 180);
  }

  function toDegrees(radians) {
    return (radians * (180 / Math.PI));
  }

  const lngDiff = toRadians(lon2 - lon1);
  const latA = toRadians(lat1);
  const latB = toRadians(lat2);
  const lngA = toRadians(lon1);

  const bx = Math.cos(latB) * Math.cos(lngDiff);
  const by = Math.cos(latB) * Math.sin(lngDiff);

  const latMidway = toDegrees(
    Math.atan2(
      Math.sin(latA) + Math.sin(latB),
      Math.sqrt((Math.cos(latA) + bx) * (Math.cos(latA) + bx) + by * by)
    )
  );
  const lngMidway = toDegrees(lngA + Math.atan2(by, Math.cos(latA) + bx));

  return [latMidway, lngMidway];
}

export default class App extends React.Component {
	constructor() {
		super();
  		this.state = {
			step: 0,

			flightSearchInfo: {
				departureAirport: 'KDAB',
				arrivalAirport: 'KATL',
				departureDate: '05-18-2021',
				returnDate: '5-21-2021',
				isRoundTrip: true,
				passengerNum: 1,
				classSelection: 'economy'
			},

			flightResponseInfo: {
			// ded
			},

			searchInfo: "",
			searchResponseInfo: {},

			mapMarkers: [[37.77, -122.4312]],
			mapPosition: [37.77, -122.4312],
			mapZoom: 8
		}
	}

	handleStateChange(newState) {
		mutateState(this, {step: newState})
	}

  handleInputInformation(param, value) {
	this.state.flightSearchInfo[param] = value;
	this.setState(this.state);
  }

  flightSearch() {
    let urlString;
    if (this.state.flightSearchInfo.isRoundTrip) {
      urlString = 'http://' + window.location.host + '/api/flights/searchRoundTrip/' + this.state.flightSearchInfo['departureAirport'] + "/" + this.state.flightSearchInfo['arrivalAirport'] + "/" + this.state.flightSearchInfo['classSelection'] + "/" + this.state.flightSearchInfo['departureDate'] + "/" + this.state.flightSearchInfo['returnDate'] + "/" + this.state.flightSearchInfo['passengerNum'] + "/";
    } else {
      urlString = 'http://' + window.location.host + '/api/flights/searchOneway/' + this.state.flightSearchInfo['departureAirport'] + "/" + this.state.flightSearchInfo['arrivalAirport'] + "/" + this.state.flightSearchInfo['classSelection'] + "/" + this.state.flightSearchInfo['departureDate'] + "/" + this.state.flightSearchInfo['passengerNum'] + "/";
    }

    fetch(urlString).then(resp => resp.json()).then(resp => {
      this.state.flightResponseInfo = resp;

	  var offer = resp.offers[0];
	  let isRoundTrip = offer.isRoundTrip;

	  let depLeg, arrLeg;
	  if (isRoundTrip) {
	    depLeg = offer.legs[0].departureAirport;
	    arrLeg = offer.legs[0].arrivalAirport;
	  } else {
	    depLeg = offer.legs[0].departureAirport;
	    arrLeg = offer.legs[offer.legs.length - 1].arrivalAirport;
	  }

	  let mp = midPoint(depLeg.lat, depLeg.lon, arrLeg.lat, arrLeg.lon);
	  this.state.mapPosition = [mp[0], mp[1]];
	  this.state.mapMarkers = [[depLeg.lat, depLeg.lon], [arrLeg.lat, arrLeg.lon]];
	  this.state.mapZoom = 4;

      this.setState(this.state);
      this.handleStateChange(2);
    })
  }

  inputSearch() {
	  let urlString = 'http://' + window.location.host + '/api/search/'+this.state.searchInfo;

	  fetch(urlString).then(resp => resp.json()).then(resp => {
        this.state.searchResponseInfo = resp;
		this.state.mapPosition = [resp.lat, resp.lon];
  	  	this.state.mapMarkers = [[resp.lat, resp.lon]];
		this.state.mapZoom = 11;

		urlString = 'http://' + window.location.host + '/api/risk/airport/' + resp.icao;
		fetch(urlString).then(respR => respR.json()).then(respRisk => {
			this.state.searchResponseInfo.risk = respRisk;
			this.setState(this.state);
	        this.handleStateChange(4);
		});
      })
  }

  handleSearchInfo(info) {
	  mutateState(this, {searchInfo: info})
  }

	render() {
		let content = [];
		switch(this.state.step) {
			case 0:
				content.push(<InfoBlock
		  		  changeState={()=> {
		  			  this.handleStateChange(1)
		  		  }}
            		changeInformation = {(parameter, value) => this.handleInputInformation(parameter, value)}
            />);
				break;
			case 1:
				content.push(

          <div style={{textAlign: 'center'}}>
            <h1>Searching...</h1>
          </div>
        );
				this.flightSearch();
				break;
			case 2:
				content.push(<RecordReturn
					changeState={()=> {
						this.handleStateChange(0)
					}}
					jsonData = {
						this.state.flightResponseInfo
					}
				/>);
			  	break;
			case 3:
				content.push(<h1>Searching...</h1>);
				this.inputSearch();
				break;
			case 4:
				content.push(<SearchResult
					result={this.state.searchResponseInfo}
					changeState={()=> {
						this.handleStateChange(0)
					}}
				/>);
				break;
			default:
				content = (<h1>Uhoh state undefined</h1>)
				break;
		}

	  return (<div className="App">
		  <NavHeader
		  	handleSearch={s => {this.handleSearchInfo(s)}}
			changeState={() => {
				this.handleStateChange(3);
			}}
			/>
		<MainMap markers={this.state.mapMarkers} position={this.state.mapPosition} zoom={this.state.mapZoom} />
		  {content}
	  </div>);
  }
}
