'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const APP = 'app';

// App
const app = express();
app.use(express.static("."));

app.listen(PORT, HOST, APP);
console.log(`Running on http://${HOST}:${PORT}/${APP}`);
