const authController = require("./auth.controller");
const courseController = require("./course.controller");
const instructorController = require("./instructor.controller");
const lessonController = require("./lesson.controller");
const sectionController = require("./section.controller");
const streamController = require("./stream.controller");
const studentController = require("./student.controller");
const uploadController = require("./upload.controller");

module.exports = {
  authController,
  instructorController,
  courseController,
  lessonController,
  sectionController,
  studentController,
  uploadController,
  streamController
};
