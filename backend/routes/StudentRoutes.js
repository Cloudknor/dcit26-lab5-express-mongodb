const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");

const router = express.Router();

// Only allow these fields from the request body
const pickFields = (body = {}) => {
  const allowed = ["fullName", "course", "yearLevel", "section"];
  const data = {};
  allowed.forEach((key) => {
    if (body[key] !== undefined) data[key] = body[key];
  });
  return data;
};

// Reject malformed IDs with 400 before hitting the database
const validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }
  next();
};

// GET /api/students - all records
router.get("/", async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    next(err);
  }
});

// GET /api/students/:id - one record
router.get("/:id", validateId, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    next(err);
  }
});

// POST /api/students - create
router.post("/", async (req, res, next) => {
  try {
    const student = await Student.create(pickFields(req.body));
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
});

// PUT /api/students/:id - update, returns updated document
router.put("/:id", validateId, async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      pickFields(req.body),
      { new: true, runValidators: true },
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/students/:id - delete, returns confirmation
router.delete("/:id", validateId, async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully", id: student._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
