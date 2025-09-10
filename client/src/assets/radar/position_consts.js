// radial_min / radial_max are multiples of PI
export const quadrants = [
  { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
  { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
  { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
  { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 }
]

export const rings = [
  { radius: 110 },
  { radius: 200 },
  { radius: 290 },
  { radius: 380 }
]

export const title_offset =
  { x: -675, y: -420 }

export const legend_offset = [
  { x: 500, y: 90 },
  { x: -870, y: 90 },
  { x: -870, y: -310 },
  { x: 500, y: -310 }
]

