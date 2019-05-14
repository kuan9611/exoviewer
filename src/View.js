import React, { Component } from 'react';
import Info from './Info';
import * as d3 from 'd3';

class View extends Component {
  constructor(props) {
    super(props);
    this.planets = [];
    this.view = React.createRef();
    this.state = {
      selection: null,
      radiScale: 10,
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
      v: 0.1/p.perd,
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
        .attr("r", d => d.R)
        .attr("id", d => `o${d.i}`)
        .attr("class", "orbit")
        .classed("selected", d => d === this.state.selection)
        .on("mouseover", d => handleHover(d, true))
        .on("mouseout", d => handleHover(d, false))
        .on("click", d => handleClick(d));
    container.selectAll(".planet_cluster").data(data).enter()
      .append("g")
        .attr("class", "planet_cluster")
      .append("circle")
        .attr("r", d => d.r * this.state.radiScale)
        .attr("cx", d => d.R)
        .attr("id", d => `p${d.i}`)
        .attr("class", "planet")
        .classed("selected", d => d === this.state.selection)
        .on("mouseover", d => handleHover(d, true))
        .on("mouseout", d => handleHover(d, false))
        .on("click", d => handleClick(d));
    this.updateView();

    const distAxis = d3.axisBottom(distScale).ticks(5);
    const gDistAxisGroup = svg.append("g")
      .attr('transform', `translate(${w/2},${h-50})`)
      .attr("class", "dist-axis");
    gDistAxisGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${w/4-25},${35})`)
        .text("AU");
    const gDistAxis = gDistAxisGroup.append("g").call(distAxis);
    svg.call(d3.zoom().on("zoom", () => {
      svg.selectAll(".orbit").attr("r", d => d.R * d3.event.transform.k);
      svg.selectAll(".planet").attr("cx", d => d.R * d3.event.transform.k);
      const dom = [0, distScale.domain()[1] / d3.event.transform.k];
      gDistAxis.call(distAxis.scale(distScale.copy().domain(dom)));
    }));

    this.interval = setInterval(() => {
      svg.selectAll(".planet_cluster")
        .attr("transform", d => {
          return `rotate(${(Date.now() - t0) * d.v})`;
        });
    }, 100);
  }

  updateView() {
    const svg = d3.select(this.view.current);
    svg.selectAll(".orbit").classed("hidden", d => d.hidden);
    svg.selectAll(".planet_cluster").classed("hidden", d => d.hidden)
      .selectAll("circle").attr("r", d => d.r * this.state.radiScale);
  }

  clearSelected() {
    d3.selectAll(".orbit.selected").classed("selected", false);
    d3.selectAll(".planet.selected").classed("selected", false);
    this.setState({ selection: null });
  }

  handleRadiusScaleChange(radiScale) {
    this.setState({ radiScale });
  }

  render() {
    this.planets.forEach(p => {
      p.hidden = !this.props.data[p.i].selected;
    });
    this.updateView();
    const { selection, radiScale } = this.state;
    return (
      <div className="View">
        <svg ref={this.view} />
        {selection && !selection.hidden &&
          <Info
            info={selection}
            closeListener={() => this.clearSelected()}
          />
        }
        <input className="radi-slider"
          type="range"
          min="5" max="100" step="5" value={radiScale}
          onChange={e => this.handleRadiusScaleChange(e.target.value)}
        />
      </div>
    )
  }
}

export default View;
