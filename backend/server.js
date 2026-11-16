const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const busRoutes = require("./routes/busRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api", busRoutes);

app.get("/", (req, res) => {
  res.send("Dhaka Bus Route Finder API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
