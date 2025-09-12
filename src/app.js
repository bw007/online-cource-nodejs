const express = require("express");
const path = require("path");

const { setupBasicMiddleware, setupErrorMiddleware } = require("@/middlewares");
const config = require("@/config");
const routes = require("@/routes");
const { swaggerSetup } = require("@/swagger");
const passport = require("@/config/passport");

const app = express();

// Swagger setup
swaggerSetup(app, config);

// Setup base middleware
setupBasicMiddleware(app);

// Passport initialization
app.use(passport.initialize());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routers
app.use("/api", routes);

// Error handling middleware
setupErrorMiddleware(app);

module.exports = app;