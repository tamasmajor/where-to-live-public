import LatLon from 'geodesy/latlon-ellipsoidal-vincenty.js';

function construct(request) {
  const origin = new LatLon(request.origin.lat, request.origin.lon);
  const grid = calculateGridPoints(origin, request.resolution, request.radius)
    .map(p => {
      return {
        'lat': p.lat,
        'lon': p.lon,
        'bounds': calculateBounds(p, request.resolution)
      }
    })

  return {
    'status': 'CREATED',
    'target': request.target,
    'origin': request.origin,
    'resolution': request.resolution,
    'radius': request.radius,
    'grid': grid
  }
}

function calculateGridPoints(origin, resolution, radius) {
  const width = Math.floor(radius / resolution);
  const centerLine = [origin];
  for (let i = 1; i <= width; i++) {
    centerLine.push(origin.destinationPoint(i * resolution, 90))
    centerLine.push(origin.destinationPoint(i * resolution, 270))
  }
  const gridPoints = [...centerLine];
  for (let i = 1; i <= width; i++) {
    for (let j = 0; j < centerLine.length; j++) {
      gridPoints.push(centerLine[j].destinationPoint(i * resolution, 0));
      gridPoints.push(centerLine[j].destinationPoint(i * resolution, 180));
    }
  }
  return gridPoints.filter(p => p.distanceTo(origin) <= radius + resolution * 0.5);
}

function calculateBounds(point, resolution) {
  const d = resolution / 2;
  const topLeft = {
    'lat': point.destinationPoint(d, 0).lat,
    'lon': point.destinationPoint(d, 270).lon
  }
  const bottomRight = {
    'lat': point.destinationPoint(d, 180).lat,
    'lon': point.destinationPoint(d, 90).lon
  }
  return [[topLeft.lat, topLeft.lon], [bottomRight.lat, bottomRight.lon]]
}

const gridService = {
  construct
};

export default gridService;