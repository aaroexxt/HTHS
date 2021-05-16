import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
	searchReturned: {
		display: 'flex',
		justifyContent: 'center',
		padding: '2vh',
	},
	innerSearch: {
		width: '90%',
	},
});


class SearchResult extends React.Component {
	constructor() {
		super();
	}


	render() {
		const {classes} = this.props;
		let result = this.props.result;
		return (
			<div className={classes.processedData}>
				<div className={classes.searchReturned}>
					<div className={classes.innerSearch}>
						<h1>Search Result</h1>
						<h2>Closest Airport: {result.name} ({result.icao})</h2>
						<h2>Location: {result.city + ', ' + result.subd+ ", "+result.country}</h2>
					</div>
					<div>
						<Button variant="contained" color="primary" onClick={this.props.changeState}>Back To Search</Button>

					</div>
				</div>
				<div className={classes.COVIDreport}>
					<h1>COVID, Security, and Analysis</h1>
				</div>
			</div>



		)
	}
}


SearchResult.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SearchResult);
