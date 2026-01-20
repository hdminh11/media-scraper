'use strict';

require('dotenv').config();
const express = require('express');
const router = require('./routes');
const cors = require('cors');

const app = express();

// Allow all CORS origins
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router)

module.exports = app;