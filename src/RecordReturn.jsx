
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = (theme) => ({

})

class RecordReturn extends React.Component {
  constructor() {
    super();
  }

  generateRecords() {
    let records = this.props.records;
    let content = [];
    for (let i=0; i<records.length; i++) {
    content.push(<h1>{records[i].name}</h1>);
    }
    return content;
  }

  getRecords() {
    
  }

  render() {
    return (
    <div>
      <p>All the records</p>
        {this.generateRecords()}
      </div>
    );
  }
}

RecordReturn.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(RecordReturn);
