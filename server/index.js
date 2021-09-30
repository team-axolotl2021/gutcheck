const express = require('express')
const path = require('path')
require('dotenv').config();
const fs = require('fs')
const cors = require('cors');
const OktaJwtVerifier = require('@okta/jwt-verifier');
const {db, models} = require('../sql/sequelize');
const {Sequelize} = require('sequelize');


const oktaJwtVerifier = new OktaJwtVerifier({
  clientId: process.env.OKTA_CLIENT_ID,
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
});

const entryRouter = require('./routes/entryRouter.js');
const { ModeSharp } = require('@mui/icons-material');

const app = express(); 
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads


app.use(express.static(path.resolve(__dirname, '../client')))


db.sync({  }); // implement the data model change for the sync 


app.get('/', (req, res, next) => {
  res.sendFile(path.resolve(__dirname, '../index.html'))
})

app.use(async (req, res, next) => {
  try {
    if (!req.headers.authorization) throw new Error('Authorization header is required');

    const accessToken = req.headers.authorization.trim().split(' ')[1];
    await oktaJwtVerifier.verifyAccessToken(accessToken, 'api://default');
    next();
  } catch (error) {
    next(error.message);
  }
});

app.use('/entry', entryRouter);

app.get('/dummy', (req, res) => {
  res.status(200);
})

//global error handler
app.use(function(err, req, res, next) {
  console.log("Global error handler");
  return res.status(400).json(err);
})

app.listen(3000, () => {
  console.log('Running on port 3000')
})