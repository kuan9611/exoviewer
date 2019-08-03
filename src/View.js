import React, { Component } from 'react';
import Control from './Control';
import Info from './Info';
import * as d3 from 'd3';

class View extends Component {
  constructor(props) {
    super(props);
    this.planets = [];
    this.view = React.createRef();
    this.zoomlevel = 1;
    this.state = {
      showScale: true,
      selection: null,
      rFactor: 10,
      vFactor: -2,
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data.length < this.props.data.length) {
      this.makePlanets();
      this.makeView();
    }
  }

  componentDidMount() {
    window.addEventListener("resize", () => this.makeView());
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    window.removeEventListener("resize", () => this.makeView());
  }

  makePlanets() {
    this.planets = this.props.data.map(p => ({
      ...p,
      i: p.indx,
      _R: p.dist,
      _r: p.radi || Math.pow(p.mass, 0.32143),
      v: 1/p.perd,
      hidden: !p.selected,
    }));
  }

  makeView() {
    clearInterval(this.interval);
    const t0 = new Date().setHours(0,0,0,0);

    const w = window.innerWidth - 300;
    const h = window.innerHeight;

    const data = this.planets;
    const distScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, w/2-60]);
    const radiScale = d3.scaleLinear()
      .domain([0, data.reduce((max, d) => Math.max(max, d._r), 0)])
      .range([0, 1]);
    data.forEach(d => {
      d.R = distScale(d._R);
      d.r = radiScale(d._r);
    });

    const svg = d3.select(this.view.current)
      .attr("width", w)
      .attr("height", h);
    svg.selectAll("*").remove();

    svg.append("circle")
      .attr("r", 1)
      .attr("cx", w/2)
      .attr("cy", h/2)
      .attr("id", "sun");

    const container = svg.append("g")
      .attr("transform", `translate(${w/2},${h/2})`);

    const handleHover = (d, enter) => {
      d3.select(`#o${d.i}`).classed("hover", enter);
      d3.select(`#p${d.i}`).classed("hover", enter);
    }
    const handleClick = d => {
      this.clearSelected();
      this.setState({ selection: d });
      d3.select(`#o${d.i}`).classed("selected", true);
      d3.select(`#p${d.i}`).classed("selected", true);
    }

    container.selectAll(".orbit").data(data).enter()
      .append("circle")
        .attr("id", d => `o${d.i}`)
        .attr("class", "orbit")
        .on("mouseover", d => handleHover(d, true))
        .on("mouseout", d => handleHover(d, false))
        .on("click", d => handleClick(d));
    container.selectAll(".planet_cluster").data(data).enter()
      .append("g")
        .attr("class", "planet_cluster")
      .append("circle")
        .attr("id", d => `p${d.i}`)
        .attr("class", "planet")
        .on("mouseover", d => handleHover(d, true))
        .on("mouseout", d => handleHover(d, false))
        .on("click", d => handleClick(d));

    const gDistAxisGroup = svg.append("g")
      .attr('transform', `translate(${w/2},${h-65})`)
      .attr("class", "dist-axis");
    gDistAxisGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${w/4-25},${35})`)
      .text("AU");
    gDistAxisGroup.append("g").attr("class", "dist-axis-core");

    this.updateView(distScale);

    svg.call(d3.zoom().on("zoom", () => {
      this.zoomlevel = d3.event.transform.k;
      this.updateView(distScale);
    }));

    this.interval = setInterval(() => {
      svg.selectAll(".planet_cluster")
        .attr("transform", d => {
          const v = d.v * Math.pow(2, this.state.vFactor);
          return `rotate(${(Date.now() - t0) * v})`;
        });
    }, 100);
  }

  updateView(distScale) {
    const svg = d3.select(this.view.current);

    svg.selectAll(".orbit")
      .classed("hidden", d => d.hidden)
      .classed("selected", d => d === this.state.selection)
      .attr("r", d => d.R * this.zoomlevel);
    svg.selectAll(".planet_cluster")
      .classed("hidden", d => d.hidden)
      .selectAll("circle")
        .classed("selected", d => d === this.state.selection)
        .attr("cx", d => d.R * this.zoomlevel)
        .attr("r", d => d.r * this.state.rFactor);
    svg.select(".dist-axis")
      .classed("hidden", !this.state.showScale);

    if (distScale) {
      const dom = [0, distScale.domain()[1] / this.zoomlevel];
      const distAxis = d3.axisBottom(distScale.copy().domain(dom)).ticks(5);
      svg.select(".dist-axis-core").call(distAxis);
    }
  }

  clearSelected() {
    d3.selectAll(".orbit.selected").classed("selected", false);
    d3.selectAll(".planet.selected").classed("selected", false);
    this.setState({ selection: null });
  }

  handleRadiusFactorChange(rFactor) {
    this.setState({ rFactor });
  }

  handleVelocityFactorChange(vFactor) {
    this.setState({ vFactor });
  }

  toggleShowScale() {
    this.setState({ showScale: !this.state.showScale });
  }

  render() {
    this.planets.forEach(p => {
      p.hidden = !this.props.data[p.i].selected;
    });
    this.updateView();
    const { selection, rFactor, vFactor, showScale } = this.state;
    const count = this.props.data.reduce((acc, p) => {
      return acc + (p.selected? 1 : 0);
    }, 0);
    return (
      <div className="View">
        <svg ref={this.view} />
        {selection && !selection.hidden &&
          <Info
            info={selection}
            closeListener={() => this.clearSelected()}
          />
        }
        <Control
          rFactor={rFactor}
          vFactor={vFactor}
          showScale={showScale}
          rFactorListener={rf => this.handleRadiusFactorChange(rf)}
          vFactorListener={vf => this.handleVelocityFactorChange(vf)}
          showScaleListener={() => this.toggleShowScale()}
        />
        <div className="footer overlay">
          Showing {count} of {this.props.data.length} planets,
          last updated May 2019.
          Planetary radii not to scale.
          Created by
          <a href="https://github.com/leafsy/exoviewer"
            target="_blank" rel="noopener noreferrer">
            leafsy
          </a>
          and powered by
          <a href="http://exoplanet.eu/"
            target="_blank" rel="noopener noreferrer">
            The Extrasolar Planets Encyclopaedia
          </a>
        </div>
      </div>
    )
  }
}

export default View;
