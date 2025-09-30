const validators = require('./validators');
const shared = require('./shared');
const auth = require("./auth");
const errors = require("./errors");
const { setupBasicMiddleware, setupErrorMiddleware } = require("./base.middleware");

module.exports = {
  setupBasicMiddleware,
  setupErrorMiddleware,
  ...auth,
  ...errors,
  ...validators
};
