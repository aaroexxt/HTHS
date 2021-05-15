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
  textField: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    minWidth: 200,
    padding: 2,
    margin: 3.5,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 121,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  paxNum: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  }
})

class InfoBlock extends React.Component {
  constructor() {
    super();

    this.state = {
      isRoundTrip: true
    }
  }

  //goes in the react class
  handleOneWayPivot(e) {
  	if (e.target.value) {
  		mutateState(this, {isRoundTrip: true})
  	} else {
  		mutateState(this, {isRoundTrip: false})
  	}
  }

    render() {
      const {classes} = this.props;

      return (
        <FormControl className={classes.formControl} >
          <form className={classes.root} noValidate id="queryEntryContainer" autoComplete="on">


            <TextField id="departure-search" label="Departure" variant="outlined" className={classes.textField} />
            <TextField id="arrival-search" label="Arrival" variant="outlined" className={classes.textField} />

          </form>



          <form className={classes.container} id="dateSelectors" noValidate >
            <TextField
              id="departure-date-selector"
              label="Departure Date"
              type="date"
              defaultValue="2021-05-15"
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id="arrival-date-selector"
              label="Return Date"
              type="date"
              defaultValue="2021-05-17"
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              style={{display: this.state.isRoundTrip ? "block" : "none"}}
            />
          </form>

          <form className={classes.root} noValidate id="submitButton">
            <Select
              className={classes.root}
              labelId="isRoundTripSelector"
              id="isRoundTripSelectorID"
              value={this.state.isRoundTrip}
              onChange={(e) => {this.handleOneWayPivot(e)}}
            >
              <MenuItem value={true}>Round Trip</MenuItem>
              <MenuItem value={false}>One Way</MenuItem>
            </Select>

            <TextField
              className={classes.paxNum}
              id="numberPax"
              label="Passengers"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
            />

          </form>

        </FormControl>

      );
    }


}


InfoBlock.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(InfoBlock);
