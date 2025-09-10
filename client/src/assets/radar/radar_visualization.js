// The MIT License (MIT)

// Copyright (c) 2017-2024 Zalando SE

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import * as d3 from "d3";
import { rings, legend_offset, title_offset } from "./position_consts"
import {
	viewbox,
	translate,
	mouse_out,
	mouse_over,
	legend_transform,
	positioning_function
} from "./aid_functions"

/**
 * Configuración del radar.
 * @typedef {Object} RadarConfig
 * @property {string} [svg="radar"] - ID del elemento SVG donde se renderizará el radar.
 * @property {number} [width=1450] - Ancho del radar en píxeles.
 * @property {number} [height=1000] - Altura del radar en píxeles.
 * @property {Object} [colors] - Colores personalizados para el radar.
 * @property {string} [colors.background="#2f2c79"] - Color de fondo del radar.
 * @property {string} [colors.grid="#888"] - Color de las líneas de la cuadrícula.
 * @property {string} [colors.inactive="#ddd"] - Color para elementos inactivos.
 */

const radar_visualization = (config) => {
	config.svg_id = config.svg || "radar"
	config.width = config.width || 1450
	config.height = config.height || 1000
	config.colors = ("colors" in config) ? config.colors : {
		background: "#2f2c79",
		grid: '#888',
		inactive: "#ddd",
	};

	config.print_layout = ("print_layout" in config) ? config.print_layout : true
	config.links_in_new_tabs = ("links_in_new_tabs" in config) ? config.links_in_new_tabs : true
	config.repo_url = config.repo_url || '#'
	config.print_ring_descriptions_table = ("print_ring_descriptions_table" in config) ? config.print_ring_descriptions_table : false
	config.footer_offset = config.footer_offset || { x: -155, y: 450 }

	// define default font-family
	config.font_family = config.font_family || "Arial, Helvetica"

	// adjust with config.scale
	config.scale = config.scale || 1
	
	const scaled_width = config.width * config.scale
	const scaled_height = config.height * config.scale

	const svg = d3.select("svg#" + config.svg_id)
		.style("background-color", config.colors.background)
		.attr("width", scaled_width)
		.attr("height", scaled_height)

	const radar = svg.append("g")

	if ("zoomed_quadrant" in config) {
		svg.attr("viewBox", viewbox(config.zoomed_quadrant))
	} else {
		radar.attr("transform", translate(scaled_width / 2, scaled_height / 2).concat(`scale(${config.scale})`))
	}

	const grid = radar.append("g")

	// draw grid lines
	grid.append("line")
		.attr("x1", 0).attr("y1", -400)
		.attr("x2", 0).attr("y2", 400)
		.style("stroke", config.colors.grid)
		.style("stroke-width", 1)
	grid.append("line")
		.attr("x1", -400).attr("y1", 0)
		.attr("x2", 400).attr("y2", 0)
		.style("stroke", config.colors.grid)
		.style("stroke-width", 4)

	// background color. Usage `.attr("filter", "url(#solid)")`
	// SOURCE: https://stackoverflow.com/a/31013492/2609980
	const defs = grid.append("defs")

	const filter = defs.append("filter")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 1)
		.attr("height", 1)
		.attr("id", "solid")

	filter.append("feFlood")
		.attr("flood-color", "rgb(0, 0, 0, 0.8)")

	filter.append("feComposite")
		.attr("in", "SourceGraphic")

	// draw rings
	rings.forEach((ring, index) => {
		grid.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", ring.radius)
			.attr("position", "absolute")
			.attr("z-index", 10)
			.style("fill", 'none')
			.style("stroke", config.rings[index].color)
			.style("stroke-width", 4)

		if (config.print_layout) {
			grid.append("text")
				.text(config.rings[index].name)
				.attr("y", -ring.radius + 75)
				.attr("text-anchor", "middle")
				.style("fill", config.rings[index].color)
				.style("opacity", 0.40)
				.style("font-family", config.font_family)
				.style("font-size", "36px")
				.style("font-weight", "bold")
				.style("pointer-events", "none")
				.style("user-select", "none")
		}
	})

	// draw title and legend (only in print layout)
	if (config.print_layout) {
		// title
		radar.append("a")
			.attr("href", config.repo_url)
			.attr("transform", translate(title_offset.x, title_offset.y))
			.append("text")
			.attr("class", "hover-underline")  // add class for hover effect
			.text(config.title)
			.style("font-family", config.font_family)
			.style("font-size", "30px")
			.style("font-weight", "bold")
			.style("fill", "#ff0")

		// date
		radar
			.append("text")
			.attr("transform", translate(title_offset.x, title_offset.y + 20))
			.text(config.date || "")
			.style("font-family", config.font_family)
			.style("font-size", "14px")
			.style("fill", "#bb0")

		// footer
		radar.append("text")
			.attr("transform", translate(config.footer_offset.x - 210, config.footer_offset.y))
			.text("▲ movido hacia arriba     ▼ movido hacia abajo     ★ nuevo     ⬤ sin cambios")
			.attr("xml:space", "preserve")
			.style("font-family", config.font_family)
			.style("font-size", "22px")
			.style("fill", "#333");
	}


	// legend
	const legend = radar.append("g")

	const segmented = positioning_function(config)

	for (let quadrant = 0; quadrant < 4; quadrant++) {
		legend
			.append("text")
			.attr("transform", translate(
				legend_offset[quadrant].x - 50,
				legend_offset[quadrant].y - 45
			))
			.text(config.quadrants[quadrant].name)
			.style("font-family", config.font_family)
			.style("font-size", "30px")
			.style("font-weight", "600")
			.style("fill", "#333")

		for (let ring = 0; ring < 4; ring++) {
			legend.append("text")
				.attr("transform", legend_transform(segmented, quadrant, ring))
				.text(config.rings[ring].name)
				.style("font-family", config.font_family)
				.style("font-size", "20px")
				.style("font-weight", "bold")
				.style("font-style", "italic")
				.style("fill", config.rings[ring].color)

			legend.selectAll(".legend" + quadrant + ring)
				.data(segmented[quadrant][ring])
				.enter()
				.append("a")
				.attr("href", (data) => data.link ? data.link : "#") // stay on same page if no link was provided

				// Add a target if (and only if) there is a link and we want new tabs
				.attr("target", (data) => (data.link && config.links_in_new_tabs) ? "_blank" : null)
				.append("text")
				.attr("transform", (data, i) => legend_transform(segmented, quadrant, ring, i))
				.attr("class", "legend" + quadrant + ring)
				.attr("id", (data) => "legendItem" + data.id)
				.text((data) => data.id + ". " + data.label)
				.style("font-family", config.font_family)
				.style("font-size", "18px")
				.style("font-weight", "bolder")
				.style("fill", "#333")
				.on("mouseover", (e, data) => mouse_over(config, data))
				.on("mouseout", (e, data) => mouse_out(data))
		}
	}

	// rollover bubble (on top of everything else)
	const bubble = radar.append("g")
		.attr("id", "bubble")
		.attr("x", 0)
		.attr("y", 0)
		.attr("position", "absolute")
		.attr("z-index", 20)
		.style("opacity", 0)
		.style("pointer-events", "none")
		.style("user-select", "none")

	bubble.append("rect")
		.attr("rx", 4)
		.attr("ry", 4)
		.style("fill", "#333")

	bubble.append("text")
		.style("font-family", config.font_family)
		.style("font-size", "10px")
		.style("fill", "#fff")

	bubble.append("path")
		.attr("d", "M 0,0 10,0 5,8 z")
		.style("fill", "#333")


	// layer for entries
	const rink = radar.append("g")
		.attr("id", "rink")

	// draw blips on radar
	const blips = rink.selectAll(".blip")
		.data(config.entries)
		.enter()
		.append("g")
		.attr("class", "blip")
		.attr("transform", (d, i) => legend_transform(segmented, d.quadrant, d.ring, i))
		.on("mouseover", (e, data) => mouse_over(config, data))
		.on("mouseout", (e, data) => mouse_out(data))

	// configure each blip
	let blip
	blips.each((data, i, nodes) => {
		blip = d3.select(nodes[i])

		// blip link
		if (data.active && Object.prototype.hasOwnProperty.call(data, "link") && data.link) {
			blip = blip.append("a")
				.attr("xlink:href", data.link)

			if (config.links_in_new_tabs)
				blip.attr("target", "_blank")
		}

		// blip shape
		if (data.moved == 1) {
			blip.append("path")
				.attr("d", "M -16,10 16,10 0,-16 z") // triangle pointing up
				.style("fill", data.color)

		} else if (data.moved == -1) {
			blip.append("path")
				.attr("d", "M -16,-10 16,-10 0,16 z") // triangle pointing down
				.style("fill", data.color)

		} else if (data.moved == 2) {
			blip.append("path")
				.attr("d", d3.symbol().type(d3.symbolStar).size(400))
				.style("fill", data.color)

		} else {
			blip.append("circle")
				.attr("r", 16)
				.attr("fill", data.color)
		}

		// blip text
		if (data.active || config.print_layout) {
			const blip_text = config.print_layout ? data.id : data.label.match(/[a-z]/i)

			blip.append("text")
				.text(blip_text)
				.attr("y", 3)
				.attr("text-anchor", "middle")
				.style("fill", "#eee")
				.style("font-family", config.font_family)
				.style("font-size", () => blip_text.length > 2 ? "8px" : "12px")
				.style("font-weight", "bolder")
				.style("pointer-events", "none")
				.style("user-select", "none")
		}
	})

	// distribute blips, while avoiding collisions
	d3.forceSimulation()
		.nodes(config.entries)
		.velocityDecay(0.19) // magic number (found by experimentation)
		.force("collision", d3.forceCollide().radius(12).strength(0.85))
		.on("tick", () =>
			blips.attr("transform", (d) =>
				translate(d.segment.clipx(d), d.segment.clipy(d))))// make sure that blips stay inside their segment

	if (config.print_ring_descriptions_table) {
		const table = d3.select("body").append("table")
			.attr("class", "radar-table")
			.style("border-collapse", "collapse")
			.style("position", "relative")
			.style("top", "-70px")  // Adjust this value to move the table closer vertically
			.style("margin-left", "50px")
			.style("margin-right", "50px")
			.style("font-family", config.font_family)
			.style("font-size", "13px")
			.style("text-align", "left")

		const thead = table.append("thead")
		const tbody = table.append("tbody")

		// define fixed width for each column
		const columnWidth = `${100 / config.rings.length}%`

		// create table header row with ring names
		const headerRow = thead.append("tr")
			.style("border", "1px solid #ddd")

		headerRow.selectAll("th")
			.data(config.rings)
			.enter()
			.append("th")
			.style("padding", "8px")
			.style("border", "1px solid #ddd")
			.style("background-color", d => d.color)
			.style("color", "#fff")
			.style("width", columnWidth)
			.text(d => d.name)

		// create table body row with descriptions
		const descriptionRow = tbody.append("tr")
			.style("border", "1px solid #ddd")

		descriptionRow.selectAll("td")
			.data(config.rings)
			.enter()
			.append("td")
			.style("padding", "8px")
			.style("border", "1px solid #ddd")
			.style("width", columnWidth)
			.text(d => d.description)
	}
}

export default radar_visualization;