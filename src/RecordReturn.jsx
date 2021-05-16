
import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Tooltip from '@material-ui/core/Tooltip';
import Slider from '@material-ui/core/Slider';
import './App.css';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';

import { createMuiTheme } from '@material-ui/core/styles'

const theme = createMuiTheme({
  palette: {
    action: {
      disabledBackground: '#252dba',
    },
  },
})

const styles = (theme) => ({
  goBackButton: {
    position: 'fixed',
    zIndex: 10000000,
    backgroundColor: '#282828',
    color: 'white',
    float: 'left',
    marginTop: -550,
    marginLeft: 50,
  },
})

class RecordReturn extends React.Component {
  constructor() {
    super();

  }

  getAllInfo() {
    let content = [];
    for (let x = 0; x < this.props.jsonData.offers.length; x++) {
      let offer = this.props.jsonData.offers[x];
      content.push(<DisplayCard
        offer={offer}

         />)


    }
    return content;
  }



  render() {
    const {classes} = this.props;
    return (
      <div>

        <Button onClick={this.props.changeState} className={classes.goBackButton}>Back To Search</Button>

        <div>
          {this.getAllInfo()}
        </div>

      </div>
    );
  }
}

// {offer.airline}

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  root: {
    width: '100%',
    background: 'linear-gradient(45deg, #53a6ff 30%, #ff5353 90%)',
  },
  heading: {
    fontSize: '3vh',
  },
  legOrg: {
    display: 'flex',
    flexDirection: 'row',
  },
  legDisplay: {

  },
  flightLeg: {
    fontSize: '3vh',
  },
  containerBox: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cardDisplay: {
    width: '90%',
    backgroundColor: '#eeeeee',
    padding: '4vh',
    margin: '3vh',
    display: 'flex',
    flexDirection: 'column',
  },
  primaryInfo: {
    display: 'flex',
    flexDirection: 'row',

  },
  glanceData: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightsLegData: {
    fontSize: '2.7vh',
    padding: '1vh',
    margin: '1vh',

  },
  briefTitle: {
    fontSize: '3.2vh',
    width: '65%',
  },
  costAndEmissions: {
    fontSize: '3.3vh',
    width: '35%',
    textAlign: 'center',
  },
  priceNum: {
    fontSize: '4vh',
    fontWeight: 'bold',
  },
  flexElements: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: '1vh',
    margin: '2vh',
    maxWidth: '28vw',
    backgroundColor: '#f7f7f7',
    textAlign: 'center',
  },
  flexItem: {
    display: 'flex',
    padding: '1.5vh',
    margin: '0.5vh',
    fontWeight: 'bold',
    fontSize: '2.4vh',
  },
  verticalSection: {
    width: '100%',
  },
  marginSlider: {
    marginBottom: '2vh',
  },
}));



function DisplayCard(props) {
  var offer = props.offer;
  let isRoundTrip = offer.isRoundTrip;

  let depLeg, arrLeg;
  if (isRoundTrip) {
    depLeg = offer.legs[0].departureAirport;
    arrLeg = offer.legs[0].arrivalAirport;
  } else {
    depLeg = offer.legs[0].departureAirport;
    arrLeg = offer.legs[offer.legs.length - 1].arrivalAirport;
  }

  console.log(arrLeg.risk)

  const classes = useStyles();
  return (


    <div className={classes.containerBox}>
      <div className={classes.cardDisplay}>

          <div>
            <h1>Flight {depLeg.iata} to {arrLeg.iata} ({offer.airline})</h1>
          </div>
          <div className={classes.glanceData}>
            <div>
              <p className={classes.briefTitle}>{depLeg.name} to {arrLeg.name}</p>
            </div>
            <div className={classes.costAndEmissions}>
              <p><span className={classes.priceNum}>{offer.cost}</span><br />
              CO2 Emissions: {offer.emissions} kg</p>
            </div>
        </div>



        <div className={classes.safetyPopout}>
        <div className={classes.accordionStuff}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Detailed Flight Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
            <div className={classes.primaryInfo}>
              <div className={classes.flightInfo}>
                <LegCards
                  legs = {offer.legs}
                />
              </div>
            </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Health, Environment, and Safety Report</Typography>
            </AccordionSummary>
            <AccordionDetails>
            <div class={classes.verticalSection}>
              <div className={classes.marginSlider} />
                <Typography gutterBottom>Covid Risk: {arrLeg.risk.covidRisk}</Typography>
                <PrettoSlider className={classes.root} valueLabelDisplay="auto" aria-label="pretto slider" defaultValue={arrLeg.risk.covidRisk} disabled/>
              <div className={classes.marginSlider} />
                <Typography gutterBottom>Homicide: {arrLeg.risk.homicide} Index</Typography>
                <PrettoSlider className={classes.root} valueLabelDisplay="auto" aria-label="pretto slider" defaultValue={arrLeg.risk.homicide} disabled/>
              <div className={classes.marginSlider} />
                <Typography gutterBottom>Corruption: {arrLeg.risk.corruption} Index</Typography>
                <PrettoSlider className={classes.root} valueLabelDisplay="auto" aria-label="pretto slider" defaultValue={arrLeg.risk.corruption} disabled/>
              <div className={classes.marginSlider} />
                <Typography gutterBottom>CO2: {offer.emissions} kg </Typography>
                <PrettoSlider className={classes.root} valueLabelDisplay="auto" aria-label="pretto slider" defaultValue={offer.emissions/10} disabled/>

          </div>

            </AccordionDetails>
          </Accordion>
          </div>
        </div>

      </div>
    </div>
  );
}

function ValueLabelComponent(props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

  ValueLabelComponent.propTypes = {
    children: PropTypes.element.isRequired,
    open: PropTypes.bool.isRequired,
    value: PropTypes.number.isRequired,
  };



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

function LegCard(props) {
  let leg = props.leg;
  const classes = useStyles();
  return (
    <div className={classes.legOrg}>
      <div className={classes.legDisplay}>
        <h2>Leg #{props.legIndex} - <span>Flight {leg.flightNumber} </span></h2>
        <div className={classes.flightLeg}>
          <div className={classes.flights}>
            <p><strong>{leg.times.departureTime}</strong> | {leg.departureAirport.name} ({leg.departureAirport.iata})<br/><br/> <strong>{leg.times.arrivalTime}</strong> | {leg.arrivalAirport.name} ({leg.arrivalAirport.iata}) </p>
            <p><em>Departure Date: </em>{leg.times.departureDate}</p>

          </div>
        </div>
      </div>
      <div className={classes.legDisplay}>
        <div className={classes.flightsLegData}>
          <div className={classes.flexElements}>
            <span className={classes.flexItem}>Aircraft Type: {leg.planeType}</span>
            <span className={classes.flexItem}>Time Enroute: {leg.times.total}</span>
            <span className={classes.flexItem}>Distance: {leg.distance} mi</span>
          </div>

        </div>
      </div>
    </div>
  );
}


function LegCards(props) {
  let legs = props.legs
  const classes = useStyles();
  let contentArray = [];
  for (let legIndex = 0; legIndex < legs.length; legIndex++) {
    contentArray.push(<LegCard leg = {legs[legIndex]} legIndex = {legIndex + 1} />)
  }
  return (
    <div>
    {contentArray}
    </div>
  );
}




RecordReturn.propTypes = {
  classes: PropTypes.object.isRequired
}


export default withStyles(styles)(RecordReturn);
