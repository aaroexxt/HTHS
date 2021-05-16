
import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = (theme) => ({

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
        offer={offer} />)


    }
    return content;
  }



  render() {
    return (
      <div>
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
  },
  heading: {
    fontSize: '3vh',
  },
  departureFlightLeg: {
    fontSize: '3vh',
  },
  arrivalFlightLeg: {
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
  priceAndCarbon: {
    background: '#282828',
    color: 'white',
    padding: '4vh',
    margin: '1vh',
    marginBottom: '3vh',
  },
  flightInfo: {

  },
  flightsLegData: {
    fontSize: '2.5vh',
    backgroundColor: '#282828',
    color: 'white',
    padding: '2vh',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '2vh',
  },
}));



function DisplayCard(props) {
  var offer = props.offer;

  const classes = useStyles();
  return (


    <div className={classes.containerBox}>

      <div className={classes.cardDisplay}>
        <div className={classes.headerBar}>
          <h1>Flights</h1>
        </div>

          <div className={classes.priceAndCarbon}>
            <h2>{offer.cost}</h2>
            <h4>Estimated Carbon: {offer.emissions} kg</h4>


        </div>

        <div className={classes.safetyPopout}>
        <div className={classes.root}>
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
              <Typography className={classes.heading}>COVID, Safety, and Quality Analysis</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                sit amet blandit leo lobortis eget.
              </Typography>
            </AccordionDetails>
          </Accordion>
          </div>
        </div>

      </div>
    </div>
  );
}

function LegCard(props) {
  let leg = props.leg;
  const classes = useStyles();
  console.log(leg)
  return (
    <div className={classes.legOrg}>
      <div className={classes.legDisplay}>
        <h3>Leg #{props.legIndex}</h3>
        <div className={classes.departureFlightLeg}>
          <div className={classes.flights}>
            <p>{leg.departureAirport.name} ({leg.departureAirport.iata})    |    <strong>{leg.times.departure}</strong></p>
          </div>
        </div>
        <div className={classes.arrivalFlightLeg}>
          <p>{leg.arrivalAirport.name} ({leg.departureAirport.iata})    |    <strong>{leg.times.arrival}</strong> </p>
        </div>
        <div className={classes.flightsLegData}>
          <p>Flight {leg.flightNumber} | Distance: {leg.distance} mi</p>
          <p>Aircraft Type: {leg.planeType} | Time Enroute: {leg.times.total}</p>
        </div>
        <br />

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
