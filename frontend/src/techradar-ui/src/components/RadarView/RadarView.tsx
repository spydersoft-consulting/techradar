/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint no-prototype-builtins: 0 */

import { Component } from "react";
import * as api from "../../api/Data";
import * as d3 from "d3";

//  BASED ON CODE FROM ZALANDO

interface RadarViewProps {
  data: api.RadarData;
  zoomed_quadrant?: number;
  height: number;
  width: number;
}

interface RadarViewState {
  tickCount: number;
}

interface CartesianPoint {
  x: number;
  y: number;
}

interface PolarPoint {
  t: number;
  r: number;
}

interface QuadrantInfo {
  radial_min: number;
  radial_max: number;
  factor_x: number;
  factor_y: number;
}

interface DrawableEntry extends api.RadarEntry {
  segment: any;
  x: number;
  y: number;
  color: string;
  id: string;
}

class RadarView extends Component<RadarViewProps, RadarViewState> {
  state: RadarViewState = {
    tickCount: 0,
  };

  async componentDidMount() {
    this.radar_visualization();
  }

  componentDidUpdate(prevProps: RadarViewProps) {
    if (
      prevProps.data !== this.props.data ||
      prevProps.height !== this.props.height ||
      prevProps.width !== this.props.width
    ) {
      this.radar_visualization();
    }

    if (prevProps.zoomed_quadrant !== this.props.zoomed_quadrant) {
      this.setZoom(this.props.zoomed_quadrant ?? -1, this.props.width, this.props.height);
    }
  }

  render() {
    return <svg id="svg" />;
  }

  quadrants: QuadrantInfo[] = [
    { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
    { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
    { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
    { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 },
  ];

  defaultRadius: number = 10;

  g_randomSeedValue: number = 0;

  random = (): number => {
    const x = Math.sin(this.g_randomSeedValue++) * 10000;
    return x - Math.floor(x);
  };

  random_between = (min: number, max: number): number => {
    return min + this.random() * (max - min);
  };

  normal_between = (min: number, max: number): number => {
    return min + (this.random() + this.random()) * 0.5 * (max - min);
  };

  polar = (cartesian: CartesianPoint): PolarPoint => {
    const x = cartesian.x;
    const y = cartesian.y;
    return {
      t: Math.atan2(y, x),
      r: Math.sqrt(x * x + y * y),
    };
  };

  cartesian = (polar: PolarPoint): CartesianPoint => {
    return {
      x: polar.r * Math.cos(polar.t),
      y: polar.r * Math.sin(polar.t),
    };
  };

  bounded_interval = (value: number, min: number, max: number): number => {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.min(Math.max(value, low), high);
  };

  bounded_ring = (polar: PolarPoint, r_min: number, r_max: number): PolarPoint => {
    return {
      t: polar.t,
      r: this.bounded_interval(polar.r, r_min, r_max),
    };
  };

  bounded_box = (point: CartesianPoint, min: CartesianPoint, max: CartesianPoint): CartesianPoint => {
    return {
      x: this.bounded_interval(point.x, min.x, max.x),
      y: this.bounded_interval(point.y, min.y, max.y),
    };
  };

  segment = (actualRingRadius: number[], quadrantsCollection: QuadrantInfo[], quadrant: number, ring: number): any => {
    const polar_min: PolarPoint = {
      t: quadrantsCollection[quadrant].radial_min * Math.PI,
      r: ring === 0 ? 30 : (actualRingRadius[ring - 1] ?? this.defaultRadius),
    };
    const polar_max: PolarPoint = {
      t: quadrantsCollection[quadrant].radial_max * Math.PI,
      r: actualRingRadius[ring] ?? this.defaultRadius,
    };
    const cartesian_min: CartesianPoint = {
      x: 15 * quadrantsCollection[quadrant].factor_x,
      y: 15 * quadrantsCollection[quadrant].factor_y,
    };
    const cartesian_max: CartesianPoint = {
      x: (actualRingRadius[actualRingRadius.length - 1] ?? this.defaultRadius) * quadrantsCollection[quadrant].factor_x,
      y: (actualRingRadius[actualRingRadius.length - 1] ?? this.defaultRadius) * quadrantsCollection[quadrant].factor_y,
    };
    return {
      clipx: (d: CartesianPoint): number => {
        const c = this.bounded_box(d, cartesian_min, cartesian_max);
        const p = this.bounded_ring(this.polar(c), polar_min.r + 15, polar_max.r - 15);
        d.x = this.cartesian(p).x; // adjust data too!
        return d.x;
      },
      clipy: (d: CartesianPoint): number => {
        const c = this.bounded_box(d, cartesian_min, cartesian_max);
        const p = this.bounded_ring(this.polar(c), polar_min.r + 15, polar_max.r - 15);
        d.y = this.cartesian(p).y; // adjust data too!
        return d.y;
      },
      random: (): CartesianPoint => {
        return this.cartesian({
          t: this.random_between(polar_min.t, polar_max.t),
          r: this.normal_between(polar_min.r, polar_max.r),
        });
      },
    };
  };

  viewbox = (quadrant: number, width: number, height: number): any => {
    const viewWidth = width / 2;
    const viewHeight = height / 2;

    let x = viewWidth * -1;
    let y = viewHeight * -1;

    if (quadrant === 0 || quadrant === 3) {
      x = -1;
    }
    if (quadrant === 0 || quadrant === 1) {
      y = -1;
    }

    return [x, y, viewWidth, viewHeight].join(" ");
  };

  translate = (x: number, y: number): string => {
    return "translate(" + x + "," + y + ")";
  };

  legend_transform = (legend_offset: any, quadrant: any) => {
    const dy = legend_offset[quadrant].runningHeight + 5;
    const dx = legend_offset[quadrant].currentColumn * 140;

    const newDy = legend_offset[quadrant].runningHeight + 21;

    if (newDy > legend_offset[quadrant].availableHeight) {
      legend_offset[quadrant].currentColumn = legend_offset[quadrant].currentColumn + 1;
      legend_offset[quadrant].runningHeight = 0;
    } else {
      legend_offset[quadrant].runningHeight = newDy;
    }

    return this.translate(legend_offset[quadrant].x + dx, legend_offset[quadrant].y + dy);
  };

  legend_transform_item = (legend_offset: any, item: any, index = null) => {
    const dy = legend_offset[item.quadrant].runningHeight + (index == null ? 5 : 0);
    const dx = legend_offset[item.quadrant].currentColumn * 140;

    const newDy = legend_offset[item.quadrant].runningHeight + (index == null ? 21 : 12);

    if (newDy > legend_offset[item.quadrant].availableHeight) {
      legend_offset[item.quadrant].currentColumn = legend_offset[item.quadrant].currentColumn + 1;
      legend_offset[item.quadrant].runningHeight = 0;
    } else {
      legend_offset[item.quadrant].runningHeight = newDy;
    }

    return this.translate(legend_offset[item.quadrant].x + dx, legend_offset[item.quadrant].y + dy);
  };

  showBubble = (d: any): any => {
    if (d.active) {
      const tooltip = this.svgNode().select("#bubble text").text(d.label);
      if (tooltip?.node()) {
        const toolNode: any = tooltip.node();
        const bbox = toolNode.getBBox();
        d3.select("#bubble")
          .attr("transform", this.translate(d.x - bbox.width / 2, d.y - 16))
          .style("opacity", 0.8);
        d3.select("#bubble rect")
          .attr("x", -5)
          .attr("y", -bbox.height)
          .attr("width", bbox.width + 10)
          .attr("height", bbox.height + 4);
        d3.select("#bubble path").attr("transform", this.translate(bbox.width / 2 - 5, 3));
      }
    }
  };

  svgNode = (): d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined> => {
    return d3.select("#svg") as d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>;
  };

  hideBubble = (): void => {
    d3.select("#bubble").attr("transform", this.translate(0, 0)).style("opacity", 0);
  };

  handleLegendClick = (d: any): void => {
    if (d.active && d.hasOwnProperty("link")) {
      window.open(d.link);
    }
  };

  highlightLegendItem = (d: any): void => {
    const legendItem = document.getElementById("legendItem" + d.id);
    if (legendItem) {
      legendItem.setAttribute("filter", "url(#solid)");
      legendItem.setAttribute("fill", "white");
    }
  };

  unhighlightLegendItem = (d: any): void => {
    const legendItem = document.getElementById("legendItem" + d.id);
    if (legendItem) {
      legendItem.removeAttribute("filter");
      legendItem.removeAttribute("fill");
    }
  };

  setZoom = (quadrant: number, width: number, height: number): void => {
    const radar = this.svgNode().select("#mainG");
    radar.attr("transform", null);
    this.svgNode().attr("viewBox", null);
    if (quadrant > -1) {
      this.svgNode().attr("viewBox", this.viewbox(quadrant, width, height));
    } else {
      radar.attr("transform", this.translate(width / 2 + 10, height / 2));
    }
  };

  radar_visualization = (): any => {
    const height: number = this.props.height;
    const width: number = this.props.width;

    this.svgNode().attr("width", width).attr("height", height);

    if (!this.props.data.rings || !this.props.data.entries || !this.props.data.quadrants) {
      return;
    }

    const actualRingRadius: number[] = [];

    this.svgNode().selectAll("*").remove();

    this.g_randomSeedValue = 42;

    // treat incoming radius value as a percentage, calculate width based on smaller of width/height
    const radiusWidth = Math.min(height, width) / 2 - 10;
    let runningRadius = 0;

    for (const ring of this.props.data.rings) {
      runningRadius = runningRadius + radiusWidth * ((ring.radius ?? 10) / 100.0);
      actualRingRadius.push(runningRadius);
    }

    const footer_offset = { x: (width / 2) * -1 + 200, y: height / 2 };

    // Calculate offset values for legends
    const polarWidth = (actualRingRadius[this.props.data.rings.length - 1] ?? this.defaultRadius) * 2;
    const polarOffset = polarWidth / 2;
    const legendWidth = (width - polarWidth) / 2;

    const legend_offset = [
      {
        x: legendWidth,
        y: 55,
        availableHeight: height / 2 - 50,
        runningHeight: 0,
        currentColumn: 0,
      },
      {
        x: (legendWidth + polarOffset) * -1,
        y: 55,
        availableHeight: height / 2 - 50,
        runningHeight: 0,
        currentColumn: 0,
      },
      {
        x: (legendWidth + polarOffset) * -1,
        y: (height / 2 - 55) * -1,
        availableHeight: height / 2 - 50,
        runningHeight: 0,
        currentColumn: 0,
      },
      {
        x: legendWidth,
        y: (height / 2 - 55) * -1,
        availableHeight: height / 2 - 50,
        runningHeight: 0,
        currentColumn: 0,
      },
    ];

    const drawableEntries: DrawableEntry[] = [];

    // position each entry randomly in its segment
    for (const dataEntry of this.props.data.entries) {
      const entry: DrawableEntry = {
        ...dataEntry,
        segment: {},
        x: 0,
        y: 0,
        color: "",
        id: "",
      };
      entry.segment = this.segment(actualRingRadius, this.quadrants, entry.quadrant ?? 0, entry.ring ?? 0);
      const point = entry.segment.random();
      entry.x = point.x;
      entry.y = point.y;
      entry.color =
        (entry.active ? this.props.data.rings[entry.ring ?? 0].color : this.props.data.colors?.inactive) ?? "#cccccc";
      drawableEntries.push(entry);
    }

    // partition entries according to segments
    const segmentedEntries: DrawableEntry[][][] = new Array<DrawableEntry[][]>(4);
    for (let quadrant = 0; quadrant < 4; quadrant++) {
      segmentedEntries[quadrant] = new Array<DrawableEntry[]>(this.props.data.rings.length);
      for (let ring = 0; ring < this.props.data.rings.length; ring++) {
        segmentedEntries[quadrant][ring] = new Array<DrawableEntry>();
      }
    }

    for (const drawableEntry of drawableEntries) {
      segmentedEntries[drawableEntry.quadrant ?? 0][drawableEntry.ring ?? 0].push(drawableEntry);
    }

    // assign unique sequential id to each entry
    let id = 1;
    for (const quadrantIndex of [2, 3, 1, 0]) {
      for (let ringIndex = 0; ringIndex < this.props.data.rings.length; ringIndex++) {
        const entries = segmentedEntries[quadrantIndex][ringIndex];
        entries.sort((a: any, b: any) => {
          return a.label.localeCompare(b.label);
        });
        for (const entry of entries) {
          entry.id = `${id++}`;
        }
      }
    }

    const radar = this.svgNode().append("g").attr("id", "mainG");

    const grid = radar.append("g");

    // draw grid lines
    grid
      .append("line")
      .attr("x1", 0)
      .attr("y1", (actualRingRadius[this.props.data.rings.length - 1] ?? this.defaultRadius) * -1)
      .attr("x2", 0)
      .attr("y2", actualRingRadius[this.props.data.rings.length - 1] ?? this.defaultRadius)
      .style("stroke", this.props.data.colors?.grid ?? "#000000")
      .style("stroke-width", 1);
    grid
      .append("line")
      .attr("x1", (actualRingRadius[this.props.data.rings.length - 1] ?? this.defaultRadius) * -1)
      .attr("y1", 0)
      .attr("x2", actualRingRadius[this.props.data.rings.length - 1] ?? this.defaultRadius)
      .attr("y2", 0)
      .style("stroke", this.props.data.colors?.grid ?? "#000000")
      .style("stroke-width", 1);

    // background color. Usage `.attr("filter", "url(#solid)")`
    // SOURCE: https://stackoverflow.com/a/31013492/2609980
    const defs = grid.append("defs");
    const filter = defs
      .append("filter")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 1)
      .attr("height", 1)
      .attr("id", "solid");
    filter.append("feFlood").attr("flood-color", "rgb(0, 0, 0, 0.8)");
    filter.append("feComposite").attr("in", "SourceGraphic");

    // draw rings
    for (let i = 0; i < this.props.data.rings.length; i++) {
      grid
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", actualRingRadius[i] ?? this.defaultRadius)
        .style("fill", "none")
        .style("stroke", this.props.data.colors?.grid ?? "#000000")
        .style("stroke-width", 1);
      grid
        .append("text")
        .text(this.props.data.rings[i].name ?? "unknown ring")
        .attr("y", (actualRingRadius[i] ?? this.defaultRadius) * -1 + 62)
        .attr("text-anchor", "middle")
        .style("fill", "#e5e5e5")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", 42)
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }

    // footer
    radar
      .append("text")
      .attr("transform", this.translate(footer_offset.x, footer_offset.y))
      .text("▲ moved out     ▼ moved in")
      .attr("xml:space", "preserve")
      .style("font-family", "Arial, Helvetica")
      .style("font-size", "10");

    // legend
    const legend = radar.append("g");
    for (let quadrantIndex = 0; quadrantIndex < 4; quadrantIndex++) {
      legend
        .append("text")
        .attr("transform", this.translate(legend_offset[quadrantIndex].x, legend_offset[quadrantIndex].y - 20))
        .text(this.props.data.quadrants[quadrantIndex].name ?? "unknown quadrant")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "18")
        .style("fill", "blue");

      for (let ringIndex = 0; ringIndex < this.props.data.rings.length; ringIndex++) {
        legend
          .append("text")
          .attr("transform", this.legend_transform(legend_offset, quadrantIndex))
          .text(this.props.data.rings[ringIndex].name ?? "unknown ring")
          .style("font-family", "Arial, Helvetica")
          .style("font-size", "12")
          .style("font-weight", "bold")
          .style("fill", "#282c34");
        legend
          .selectAll(".legend" + quadrantIndex + ringIndex)
          .data(segmentedEntries[quadrantIndex][ringIndex])
          .enter()
          .append("text")
          .attr("transform", (d: any, i: any): any => {
            return this.legend_transform_item(legend_offset, d, i);
          })
          .attr("class", "legend" + quadrantIndex + ringIndex)
          .attr("id", (d: any): string => {
            return "legendItem" + d.id;
          })
          .text((d: any): string => {
            return d.id + ". " + d.legendKey;
          })
          .style("font-family", "Arial, Helvetica")
          .style("font-size", "11")
          .on("mouseover", (d: any): void => {
            this.showBubble(d);
            this.highlightLegendItem(d);
          })
          .on("mouseout", (d: any): void => {
            this.hideBubble();
            this.unhighlightLegendItem(d);
          })
          .on("click", (d: any): void => {
            this.handleLegendClick(d);
          });
      }
    }

    // layer for entries
    const rink = radar.append("g").attr("id", "rink");

    // rollover bubble (on top of everything else)
    const bubble = radar
      .append("g")
      .attr("id", "bubble")
      .attr("x", 0)
      .attr("y", 0)
      .style("opacity", 0)
      .style("pointer-events", "none")
      .style("user-select", "none");
    bubble.append("rect").attr("rx", 4).attr("ry", 4).style("fill", "#333");
    bubble.append("text").style("font-family", "sans-serif").style("font-size", "10px").style("fill", "#fff");
    bubble.append("path").attr("d", "M 0,0 10,0 5,8 z").style("fill", "#333");

    // draw blips on radar
    const blips = rink
      .selectAll(".blip")
      .data(drawableEntries)
      .enter()
      .append("g")
      .attr("class", "blip")
      //.attr("transform", (d: any, i: any) => { return this.legend_transform_item(legend_offset, d, i); })
      .on("mouseover", (d: any): void => {
        this.showBubble(d);
        this.highlightLegendItem(d);
      })
      .on("mouseout", (d: any): void => {
        this.hideBubble();
        this.unhighlightLegendItem(d);
      });

    // configure each blip
    blips.each(function (d: any): void {
      let blip = d3.select(this);

      // blip link
      if (d.active && d.hasOwnProperty("link")) {
        blip = blip.append("a").attr("xlink:href", d.link).attr("target", "_blank") as any;
      }

      // blip shape
      if (d.isNew) {
        blip
          .append("path")
          .attr(
            "d",
            "M 0.000 5.000 L 5.000 8.660 L 4.330 2.500 L 10.000 0.000 L 4.330 -2.500 L 5.000 -8.660 L 0.000 -5.000 L -5.000 -8.660 L -4.330 -2.500 L -10.000 0.000 L -4.330 2.500 L -5.000 8.660 z",
          )
          .style("fill", d.color);
      } else if (d.moved > 0) {
        blip
          .append("path")
          .attr("d", "M -11,5 11,5 0,-13 z") // triangle pointing up
          .style("fill", d.color);
      } else if (d.moved < 0) {
        blip
          .append("path")
          .attr("d", "M -11,-5 11,-5 0,13 z") // triangle pointing down
          .style("fill", d.color);
      } else {
        blip.append("circle").attr("r", 9).attr("fill", d.color);
      }

      // blip text
      if (d.active) {
        const blip_text = d.label.match(/[a-z]/i);
        blip
          .append("text")
          .text(blip_text)
          .attr("y", 3)
          .attr("text-anchor", "middle")
          .style("fill", "#fff")
          .style("font-family", "Arial, Helvetica")
          .style("font-size", (): string => {
            return blip_text?.length > 2 ? "8" : "9";
          })
          .style("pointer-events", "none")
          .style("user-select", "none");
      }
    });

    this.setZoom(this.props.zoomed_quadrant ?? -1, width, height);

    if (this.force) {
      this.force.stop();
    }

    // distribute blips, while avoiding collisions
    this.force = d3
      .forceSimulation()
      .nodes(drawableEntries)
      .velocityDecay(0.19) // magic number (found by experimentation)
      .force("collision", d3.forceCollide().radius(10).strength(0.35));

    this.force.on("tick", (): any => {
      const blips = this.svgNode().select("#rink").selectAll(".blip").data(drawableEntries);

      blips.attr("transform", (d: DrawableEntry): any => {
        const translate = this.translate(d.segment.clipx(d), d.segment.clipy(d));
        return translate;
      });
      let tickCount = this.state.tickCount;
      tickCount++;

      if (tickCount >= 10) {
        this.force.stop();
      }
    });
  };

  force: any;
}

export default RadarView;
