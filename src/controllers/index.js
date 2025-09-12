const authController = require("./auth.controller");
const courseController = require("./course.controller");
const lessonController = require("./lesson.controller");
const streamController = require("./stream.controller");
const studentController = require("./student.controller");
const uploadController = require("./upload.controller");

module.exports = {
  authController,
  courseController,
  lessonController,
  studentController,
  uploadController,
  streamController
};
