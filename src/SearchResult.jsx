import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Slider from '@material-ui/core/Slider';

const styles = (theme) => ({
	searchReturned: {
		display: 'flex',
		justifyContent: 'center',
		padding: '2vh',
	},
	COVIDreport: {
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
		padding: '2vh',
	},
	innerSearch: {
		width: '90%',
	},
	root: {
    width: '100%',
    background: 'linear-gradient(45deg, #53a6ff 30%, #ff5353 90%)',
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
					<div class={classes.verticalSection}>
						<div className={classes.marginSlider} />
							<Typography gutterBottom>Covid Risk: {result.risk.covidRisk}</Typography>
							<PrettoSlider className={classes.root} valueLabelDisplay="auto" aria-label="pretto slider" defaultValue={result.risk.covidRisk} disabled/>
						<div className={classes.marginSlider} />
							<Typography gutterBottom>Homicide Index: {result.risk.homicide}</Typography>
							<PrettoSlider className={classes.root} valueLabelDisplay="auto" aria-label="pretto slider" defaultValue={result.risk.homicide} disabled/>
						<div className={classes.marginSlider} />
							<Typography gutterBottom>Corruption Index: {result.risk.corruption}</Typography>
							<PrettoSlider className={classes.root} valueLabelDisplay="auto" aria-label="pretto slider" defaultValue={result.risk.corruption} disabled/>
					</div>
				</div>

			</div>



		)
	}
}

const PrettoSlider = withStyles({
	root: {

		height: 8,
	},
	thumb: {
		height: 34,
		width: 34,
		backgroundColor: '#fff',
		border: '4px solid currentColor',
		marginTop: -8,
		marginLeft: -12,
		'&:focus, &:hover, &$active': {
			boxShadow: 'inherit',
		},
	},
	active: {},
	valueLabel: {
		left: 'calc(-50% + 4px)',
	},
	track: {
		height: '3vh',
		borderRadius: 4,
	},
	rail: {
		height: '3vh',
		borderRadius: 4,
	},
})(Slider);

function ValueLabelComponent(props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

SearchResult.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SearchResult);
