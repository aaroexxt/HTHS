import logo from './logo.svg';
import './App.css';
import React from 'react';
import PropTypes from 'prop-types';

import NavHeader from "./NavHeader.jsx";
import InfoBlock from "./InfoBlock.jsx";
import RecordReturn from "./RecordReturn.jsx";

export default class App extends React.Component {
	constructor() {
		super();
  		this.state = {
  			step: 0,

      searchInfo: {
        departureAirport: "",
        arrivalAirport: "",
        departureDate: "",
        returnDate: "",
        isRoundTrip: false,
        passengerNum: 1,
        classSelection: 'economy'
  		}
    }
	}

	handleStateChange(newState) {
		this.setState({step: newState})
	}

  handleInputInformation(param, value) {
    this.state.searchInfo[param] = value;
    this.setState(this.state);
  }

  APISearch() {

    let urlString;
    if (this.state.searchInfo) {
      urlString = 'http://' + window.location.host + '/api/flights/searchRoundTrip/' + this.state.searchInfo['departureAirport'] + "/" + this.state.searchInfo['arrivalAirport'] + "/" + this.state.searchInfo['classSelection'] + "/" + this.state.searchInfo['departureDate'] + "/" + this.state.searchInfo['returnDate'] + "/" + this.state.searchInfo['passengerNum'] + "/";
    } else {
      urlString = 'http://' + window.location.host + '/api/flights/searchOneway/' + this.state.searchInfo['departureAirport'] + "/" + this.state.searchInfo['arrivalAirport'] + this.state.searchInfo['classSelection'] + "/" + this.state.searchInfo['departureDate'] + "/" + this.state.searchInfo['passengerNum'] + "/";
    }

    fetch(urlString).then(resp => resp.json()).then(resp => {
      console.log(resp);
    })
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
        content.push(<h1>Searching...</h1>);
        this.APISearch();
          break;
      case 2:
        content.push(<RecordReturn
          changeState={()=> {
            this.handleStateChange(0)
          }} />);
			default:
				content = (<h1>Uhoh state undefined</h1>)
		}

	  return <div className="App">
		  <NavHeader />
		  <div className="mapBox" id="map" />
		  {content}
	  </div>;
  }
}
