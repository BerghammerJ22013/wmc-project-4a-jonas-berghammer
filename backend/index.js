'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createTables } from './schema.js';
import { seed } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


await createTables();
await seed();

app.listen(PORT, () => console.log(`SportSync API running on http://localhost:${PORT}`));
