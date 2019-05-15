import React from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText'

class Control extends React.Component {
  render() {
    const { rFactor, vFactor, showScale,
      rFactorListener, vFactorListener, showScaleListener } = this.props;
    return (
      <ExpansionPanel className="control-panel overlay">
        <ExpansionPanelSummary
          className="control-title"
          expandIcon={<ExpandMoreIcon />}
        >
          Settings
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List>
            <ListItem>
              <ListItemText primary="radius" />
              <input
                type="range"
                min="5" max="100" step="5" value={rFactor}
                onChange={e => rFactorListener(e.target.value)}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="speed" />
              <input
                type="range"
                min="-6" max="3" step="1" value={vFactor}
                onChange={e => vFactorListener(e.target.value)}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="show scale" />
              <input
                type="checkbox"
                checked={showScale}
                onChange={showScaleListener}
              />
            </ListItem>
          </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default Control;
