import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import mutateState from './mutateState.jsx';

const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  formControl: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  formElement: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    margin: 2,
    padding: 1,
    width: 250,
    minHeight: 40,

  }
})

class InfoBlock extends React.Component {
  constructor() {
    super();

    this.state = {
      isRoundTrip: true,
      classSelection: 'economy'
    }
  }

  //goes in the react class
  handleOneWayPivot(e) {
  	if (e.target.value) {
  		mutateState(this, {isRoundTrip: true})
		this.props.changeInformation("isRoundTrip", true)
  	} else {
  		mutateState(this, {isRoundTrip: false})
		this.props.changeInformation("isRoundTrip", false)
  	}
  }

  handleDepartureDate(e) {
    this.props.changeInformation("departureDate", e.target.value)
  }

  handleReturnDate(e) {
    this.props.changeInformation("returnDate", e.target.value)
  }

  handleClassChange(e) {
    mutateState(this, {classSelection: e.target.value})
    this.props.changeInformation("classSelection", e.target.value)
  }

  handleAirportDeparture(e) {
    this.props.changeInformation("departureAirport", e.target.value)
  }

  handleAirportArrival(e) {
    this.props.changeInformation("arrivalAirport", e.target.value)
  }

  handlePassengerNum(e) {
    this.props.changeInformation("passengerNum", e.target.value)
  }

	actualChangeState(state) {
		//this.props.changeState(state);
	}

    render() {
      const {classes} = this.props;

      return (
        <div className={classes.formControl} >
          <form className={classes.root} noValidate id="queryEntryContainer" autoComplete="on">


            <TextField id="departure-search" onChange={(e) => {this.handleAirportDeparture(e)}} label="Departure" variant="outlined" className={classes.formElement} />
            <TextField id="arrival-search" onChange={(e) => {this.handleAirportArrival(e)}} label="Arrival" variant="outlined" className={classes.formElement} />

          </form>



          <form className={classes.root} id="dateSelectors" noValidate >
            <TextField
              id="departure-date-selector"
              label="Departure Date"
              type="date"
              defaultValue={new Date().toLocaleDateString()}
              onChange={(e) => {this.handleDepartureDate(e)}}
              className={classes.formElement}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id="return-date-selector"
              label="Return Date"
              type="date"
              defaultValue={new Date().toLocaleDateString()}
              onChange={(e) => {this.handleReturnDate(e)}}
              className={classes.formElement}
              InputLabelProps={{
                shrink: true,
              }}
              style={{display: this.state.isRoundTrip ? "block" : "none"}}
            />
          </form>

          <form className={classes.root} noValidate id="options1">
            <Select
              className={classes.formElement}
              labelId="isRoundTripSelector"
              id="isRoundTripSelectorID"
              value={this.state.isRoundTrip}
              onChange={(e) => {this.handleOneWayPivot(e)}}
            >
              <MenuItem value={true}>Round Trip</MenuItem>
              <MenuItem value={false}>One Way</MenuItem>
            </Select>

            <TextField
              className={classes.formElement}
              id="numberPax"
              label="Passengers"
              defaultValue={1}
              type="number"
              onChange={(e) => {this.handlePassengerNum(e)}}
              InputLabelProps={{
                shrink: true,
              }}
            />

          </form>

          <form className={classes.root} noValidate id="options2">
      		  <Button
                className={classes.formElement}
      	        variant="contained"
      	        color="primary"
                label="Service Class"
      	        onClick={this.props.changeState}
      	      >
      	        Search
      	      </Button>

              <Select
                className={classes.formElement}
                labelId="classSelectionDropdown"
                id="classSelection"
                value={this.state.classSelection}
                onChange={(e) => {this.handleClassChange(e)}}
              >
                <MenuItem value={'first'}>First</MenuItem>
                <MenuItem value={'business'}>Business</MenuItem>
                <MenuItem value={'premium_economy'}>Premium Economy</MenuItem>
                <MenuItem value={'economy'}>Economy</MenuItem>
              </Select>
            </form>

        </div>

      );
    }


}


InfoBlock.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(InfoBlock);
