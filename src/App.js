import logo from './logo.svg';
import './App.css';
import React from 'react';
import PropTypes from 'prop-types';

import NavHeader from "./NavHeader.jsx";
import InfoBlock from "./InfoBlock.jsx";

export default class App extends React.Component {
	constructor() {
		super();
		this.state = {
			step: 0
		}
	}

	handleStateChange(newState) {
		this.setState({step: newState})
	}

	render() {
		let content = [];
		switch(this.state.step) {
			case 0:
				content.push(<InfoBlock
		  		  changeState={()=> {
		  			  this.handleStateChange(1)
		  		  }} />);
				break;
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
