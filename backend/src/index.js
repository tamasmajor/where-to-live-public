import directionsService from './directions-service.js';
import gridService from './grid-service.js';
import persistence from './persistence.js';
import logger from './logger.js';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyses', async (req, res) => {
  const request = req.body;
  const analysis = gridService.construct(request);
  const storedAnalysis = await persistence.createAnalysis(analysis)
  res.send(storedAnalysis);
});

app.get('/analyses', async (req, res) => {
  const analyses = await persistence.findAllAnalyses();
  res.send(analyses);
});

app.get('/analyses/:id', async (req, res) => {
  const analysisId = req.params.id;
  const analysis = await persistence.findAnalysis(analysisId);
  res.send(analysis);
});

app.post('/analyses/:id/start', async (req, res) => {
  const analysisId = req.params.id;
  directionsService.calculateGridRouteDurations(analysisId);
  res.status(202).send();
});

const port = 3000;

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});