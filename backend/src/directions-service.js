import { Client } from "@googlemaps/google-maps-services-js";
import persistence from './persistence.js';
import logger from './logger.js';

const client = new Client({});

async function calculateGridRouteDurations(id) {
    // TODO: store in the "db" with the analysis object
    const departureTime = new Date('2025-01-15T08:00:00');
    try {
        let analysis = await persistence.findAnalysis(id);
        analysis.status = 'ANALYSIS_STARTED'
        await persistence.updateAnalysis(analysis);

        let parallelCalls = 100;
        let safetyNetRemainingRounds = Math.ceil(analysis.grid.length / parallelCalls) + 20;
        let remaining = analysis.grid.filter(e => e.duration === undefined);
        // dummy throttling
        while (remaining.length > 0 && safetyNetRemainingRounds > 0) {
            const chunk = analysis.grid.filter(e => e.duration === undefined).slice(0, parallelCalls);
            const promises = chunk
                .map(e => getFastestRouteDuration(e, analysis.target, departureTime)
                .then(duration => duration === undefined ? e.duration = -1 : e.duration = duration));
            await Promise.all(promises);
            await persistence.updateAnalysis(analysis);

            safetyNetRemainingRounds--;
            analysis = await persistence.findAnalysis(id);
            remaining = analysis.grid.filter(e => e.duration === undefined);
        }
        analysis = await persistence.findAnalysis(id);
        analysis.status = 'ANALYSED'
        await persistence.updateAnalysis(analysis);
    } catch (error) {
        logger.error('Error during grid analysis: ' + error);
    }
}

// For testing purposes to not call the Directions API
async function getFastestRouteDurationFake(origin, destination, departureTime) {
    return new Promise((resolve) => {
        setTimeout(() => {
          resolve(42);
        }, 200 + Math.random() * 200);
      });
}

async function getFastestRouteDuration(origin, destination, departureTime) {
    return client.directions({
        params: {
            origin: `${origin.lat},${origin.lon}`,
            destination: `${destination.lat},${destination.lon}`,
            mode: 'transit',
            departure_time: departureTime,
            alternatives: true,
            key: process.env.GOOGLE_MAPS_API_KEY,
        },
        timeout: 5000
    }).then((response) => {
        const routeDurations = response.data.routes
            .filter(route => route.legs.length > 0)
            .map(route => route.legs[0].duration.value);
        if (routeDurations.length === 0) {
            return undefined;
        } else {
            return routeDurations.sort((a, b) => a - b)[0];
        }
    })
    .catch((e) => {
        logger.error('Error during the direction calculation' + JSON.stringify(e));
    });
}

const directionsService = {
    calculateGridRouteDurations
};
  
export default directionsService;