
import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

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
  // classes
}));



function DisplayCard(props) {
  let offer = props.offer;
  const classes = useStyles();
  return (
    <div class="card-display">

    </div>
  );
}

RecordReturn.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(RecordReturn);
