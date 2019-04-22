import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import LinkIcon from '@material-ui/icons/Link';

class Info extends React.Component {
  generateLink(name) {
    const endpoint = name.replace(/ /g,"_");
    return `http://exoplanet.eu/catalog/${endpoint}/`;
  }

  render() {
    const info = this.props.info;
    return (
      <Card className="info-card">
        <CardHeader
          action={
            <div>
              <IconButton onClick={this.props.closeListener}>
                <CloseIcon />
              </IconButton>
              <br/>
              <IconButton className="info-card-link" size="large"
                href={this.generateLink(info.name)} target="_blank">
                <LinkIcon />
              </IconButton>
            </div>
          }
          title={info.name}
        />
        <CardContent>
          <div>mass: <strong>{info.mass || "?"} M<sub>J</sub></strong></div>
          <div>radius: <strong>{info.radi || "?"} M<sub>J</sub></strong></div>
          <div>orbital period: <strong>{info.perd} days</strong></div>
          <div>semi-major axis: <strong>{info.dist} AU</strong></div>
          <div>eccentricity (not shown): <strong>{info.ecct}</strong></div>
          <div>host star: <strong>{info.star}</strong></div>
          <div>detection method: <strong>{info.type || "-"}</strong></div>
          <div>year of discovery: <strong>{info.year || "-"}</strong></div>
        </CardContent>
      </Card>
    );
  }
}

export default Info;
