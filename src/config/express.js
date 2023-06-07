const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const routes = require('../api/routes/v1');
const { logs } = require('./vars');
const strategies = require('./passport');
const error = require('../api/middlewares/error');

/**
* Express instance
* @public
*/
const app = express();

app.use(cors({
  'Access-Control-Allow-Origin': '*',
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
// app.use(cors());
// const corsOptions = {
//   origin: '*',
//   credentials: true,
//   optionSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

// enable authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use('jwt', strategies.jwt);
passport.use('facebook', strategies.facebook);
passport.use('google', strategies.google);

// mount api v1 routes
app.use('/v1', routes);
app.get('*', (req, res) => res.json({ message: 'Route Not found' }));

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
