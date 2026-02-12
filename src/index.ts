import { env } from './config/env.js';

console.log(`Starting server in ${env.NODE_ENV} mode...`);
console.log(`Server will run on port ${env.PORT}`);

// Express app setup will be added in PR #4
