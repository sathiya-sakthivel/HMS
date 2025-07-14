const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("node:path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (using IPv4)
mongoose
  .connect("mongodb://127.0.0.1:27017/hms", { family: 4 })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  Name: String,
  DOB: String,
  Designation: String,
});
const Doctor = mongoose.model("Doctor", doctorSchema);

// CRUD Routes
app.post("/doctors", async (req, res) => {
  try {
    const savedDoctor = await new Doctor(req.body).save();
    res.status(201).json(savedDoctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/doctors", async (req, res) => {
  try {
    res.json(await Doctor.find());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/doctors/:id", async (req, res) => {
  try {
    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/doctors/:id", async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve React frontend (if applicable)
app.use(express.static(path.join(__dirname, "../frontend/client/build")));
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/client/build/index.html"));
});

// 404 handler for other routes
app.all("/{*splat}", (req, res) => {
  res.status(404).json({ message: `Can't find ${req.originalUrl} on this server!` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Start server
app.listen(PORT, () => console.log(`🎯 Server running at http://localhost:${PORT}`));
