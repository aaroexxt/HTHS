import logo from './logo.svg';
import './App.css';
import React from 'react';
import PropTypes from 'prop-types';

import NavHeader from "./NavHeader.jsx";
import InfoBlock from "./InfoBlock.jsx";
import RecordReturn from "./RecordReturn.jsx";
import SearchResult from "./SearchResult.jsx";
import mutateState from "./mutateState.jsx";

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
			searchResponseInfo: {}
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
      this.setState(this.state);
      this.handleStateChange(2);
    })
  }

  inputSearch() {
	  let urlString = 'http://' + window.location.host + '/api/search/'+this.state.searchInfo;

	  fetch(urlString).then(resp => resp.json()).then(resp => {
        this.state.searchResponseInfo = resp;
		this.setState(this.state);
        this.handleStateChange(4);
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

	  return <div className="App">
		  <NavHeader
		  	handleSearch={s => {this.handleSearchInfo(s)}}
			changeState={() => {
				this.handleStateChange(3);
			}}
			/>
		  <div className="mapBox" id="map" />
		  {content}
	  </div>;
  }
}
