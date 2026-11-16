const express = require("express");
const router = express.Router();
const { findShortestPath, graph } = require("../services/routeFinder");

router.get("/search", (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "Please provide both start and end stops." });
  }
  const result = findShortestPath(start, end);
  res.json(result);
});

router.get("/stops", (req, res) => {
  res.json(Object.keys(graph).sort());
});

module.exports = router;
