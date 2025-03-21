const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const generalController = require("./controllers/general");
const inventoryController = require("./controllers/inventory");

dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static("assets")); 
app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 8069;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

app.use("/", generalController);
app.use("/inventory", inventoryController);