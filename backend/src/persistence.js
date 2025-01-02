import { JSONFilePreset } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid';

async function createAnalysis(analysis) {
  const defaultData = { analyses: {} }
  const db = await JSONFilePreset('./db/db.json', defaultData)
  
  const id = uuidv4();
  analysis.id = id;
  db.data.analyses[id] = analysis;
  await db.write()
  return analysis;
}

async function updateAnalysis(analysis) {
  const defaultData = { analyses: {} }
  const db = await JSONFilePreset('./db/db.json', defaultData)
  db.data.analyses[analysis.id] = analysis;
  await db.write()
  return analysis.id;
}

async function findAllAnalyses() {
  const defaultData = { analyses: [] }
  const db = await JSONFilePreset('./db/db.json', defaultData)
  await db.read();
  return db.data.analyses;
}

async function findAnalysis(analysisId) {
  const defaultData = { analyses: [] }
  const db = await JSONFilePreset('./db/db.json', defaultData)
  await db.read();
  return db.data.analyses[analysisId];
}

const persistence = {
  createAnalysis,
  updateAnalysis,
  findAnalysis,
  findAllAnalyses
};

export default persistence;