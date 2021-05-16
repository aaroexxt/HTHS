import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

export default class SearchResult extends React.Component {
	constructor() {
		super();
	}
	render() {
		let result = this.props.result;
		return (
			<div>
				<h1>Search Result</h1>
				<h2>Name: {result.name}</h2>
				<h3>ICAO: {result.icao}</h3>
				<h3>Location: {result.subd+", "+result.country}</h3>
				<Button variant="contained" color="primary" onClick={this.props.changeState}>Back To Search</Button>
			</div>
		)
	}
}
