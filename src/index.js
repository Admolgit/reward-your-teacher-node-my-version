// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const session = require('express-session');
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const routes = require('./api/routes/v1');

app.use('/', routes);

// open mongoose connection
mongoose.connect();

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET',
}));

// listen to requests
app.listen(port, () => logger.info(`server started on port ${port} (${env})`));

/**
* Exports express
* @public
*/
module.exports = app;
