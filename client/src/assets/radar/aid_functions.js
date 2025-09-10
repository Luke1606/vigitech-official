import { quadrants, rings, legend_offset } from "./position_consts"
import * as d3 from "d3";

// custom random number generator, to make random sequence reproducible
// source: https://stackoverflow.com/questions/521295
let seed = 42

export const random = () => {
    let x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
}


export const random_between = (min, max) => min + random() * (max - min)


export const normal_between = (min, max) => min + (random() + random()) * 0.5 * (max - min)


export const polar = (cartesian) => {
    let x = cartesian.x
    let y = cartesian.y
    return {
        t: Math.atan2(y, x), // Ángulo en radianes
        r: Math.sqrt(x * x + y * y) // Distancia desde el origen
    }
}


export const cartesian = (polar) => {
    return {
        x: polar.r * Math.cos(polar.t),
        y: polar.r * Math.sin(polar.t)
    }
}


export const bounded_interval = (value, min, max) => {
    let low = Math.min(min, max)
    let high = Math.max(min, max)
    return Math.min(Math.max(value, low), high)
}


export const bounded_ring = (polar, r_min, r_max) => {
    return {
        t: polar.t,
        r: bounded_interval(polar.r, r_min, r_max) // Ajusta la distancia radial
    }
}


export const bounded_box = (point, min, max) => {
    return {
        x: bounded_interval(point.x, min.x, max.x),
        y: bounded_interval(point.y, min.y, max.y)
    }
}


export const segment = (quadrant, ring) => {
    let polar_min = {
        t: quadrants[quadrant].radial_min * Math.PI,
        r: ring === 0 ? 30 : rings[ring - 1].radius
    }
    let polar_max = {
        t: quadrants[quadrant].radial_max * Math.PI,
        r: rings[ring].radius
    }
    let cartesian_min = {
        x: 15 * quadrants[quadrant].factor_x,
        y: 15 * quadrants[quadrant].factor_y
    }
    let cartesian_max = {
        x: rings[3].radius * quadrants[quadrant].factor_x,
        y: rings[3].radius * quadrants[quadrant].factor_y
    }
    return {
        clipx: (d) => {
            let c = bounded_box(d, cartesian_min, cartesian_max)
            let p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15)
            d.x = cartesian(p).x // adjust data too!
            return d.x
        },
        clipy: (d) => {
            let c = bounded_box(d, cartesian_min, cartesian_max)
            let p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15)
            d.y = cartesian(p).y // adjust data too!
            return d.y
        },
        random: () => {
            return cartesian({
                t: random_between(polar_min.t, polar_max.t),
                r: normal_between(polar_min.r, polar_max.r)
            })
        }
    }
}


export const translate = (x, y) => "translate(" + x + "," + y + ")"


export const viewbox = (quadrant) => {
    if (quadrant < 0 || quadrant >= quadrants.length) {
        throw new Error("Invalid quadrant index")
    }
    return [
        Math.max(0, quadrants[quadrant].factor_x * 400) - 420,
        Math.max(0, quadrants[quadrant].factor_y * 400) - 420,
        440,
        440
    ].join(" ")
}


export const positioning_function = (config) => {
    // position each entry randomly in its segment
    config.entries.forEach((entry) => {
        entry.segment = segment(entry.quadrant, entry.ring)
        let point = entry.segment.random()
        entry.x = point.x
        entry.y = point.y
        entry.color = entry.active || config.print_layout ?
            config.rings[entry.ring].color : config.colors.inactive
    })

    // partition entries according to segments
    let segmented = Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () =>
            []))

    config.entries.forEach((entry) => {
        segmented[entry.quadrant][entry.ring].push(entry)
    })

    let id = 1;

    [2, 3, 1, 0].forEach((quadrant) => {
        segmented[quadrant].forEach((entries) => {
            entries.sort((a, b) => a.label.localeCompare(b.label)) // Ordena las entradas alfabéticamente por su label
            entries.forEach((entry) => entry.id = "" + id++) // Asigna un ID único a cada entrada
        })
    })
    return segmented
}


export const legend_transform = (segmented, quadrant, ring, index = null) => {
    var dx = ring < 2 ? -50 : 180
    var dy = (index == null ? -16 : index * 16)

    if (ring % 2 === 1) {
        dy = dy + 36 + segmented[quadrant][ring - 1].length * 20;
    }
    return translate(
        legend_offset[quadrant].x + dx,
        legend_offset[quadrant].y + dy
    )
}


export const showBubble = (config, data) => {
    if (data.active || config.print_layout) {
        let tooltip = d3.select("#bubble text")
            .text(data.label);
        let bbox = tooltip.node().getBBox()

        d3.select("#bubble")
            .attr("transform", `translate(${data.x - bbox.width / 2}, ${data.y - 16})`)
            .style("opacity", 0.8)
            .raise()

        d3.select("#bubble rect")
            .attr("x", -5)
            .attr("y", -bbox.height)
            .attr("width", bbox.width + 10)
            .attr("height", bbox.height + 4)

        d3.select("#bubble path")
            .attr("transform", `translate(${bbox.width / 2 - 5}, 3)`)

        d3.select("#bubble")
            .transition()
            .duration(200)
            .attr("transform", `translate(${data.x - bbox.width / 2}, ${data.y - 16}) scale(1.1)`)
    }
}


export const hideBubble = () => {
    let bubble = d3.select("#bubble")
    bubble
        .attr("transform", "translate(0, 0)")
        .style("opacity", 0)
}


export const highlightLegendItem = (data) => {
    let legendItem = document.getElementById("legendItem" + data.id)
    legendItem.setAttribute("filter", `drop-shadow(5px 1px 2 ${data.color})`)
    legendItem.setAttribute("fill", "white")
}


export const unhighlightLegendItem = (data) => {
    let legendItem = document.getElementById("legendItem" + data.id)
    legendItem.removeAttribute("filter")
    legendItem.removeAttribute("fill")
}

export const mouse_over = (config, data) => {
    showBubble(config, data)
    highlightLegendItem(data)
}

export const mouse_out = (data) => {
    hideBubble()
    unhighlightLegendItem(data)
}

