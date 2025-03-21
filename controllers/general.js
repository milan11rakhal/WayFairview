const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/log-in");
}

function checkRole(role) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) return next();
    res.status(401).render("error", { user: req.session.user || null, message: "You are not authorized to view this page." });
  };
}

router.get("/", (req, res) => {
  res.render("home", { user: req.session.user || null });
});

router.get("/sign-up", (req, res) => {
  res.render("sign-up", { user: req.session.user || null, error: null });
});
router.post("/sign-up", async (req, res) => {
  const { email, password, firstName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.render("sign-up", { user: req.session.user || null, error: "Email already in use." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, firstName });
    await user.save();
    req.session.user = { email: user.email, firstName: user.firstName, role: "customer" };
    res.redirect("/cart"); 
  } catch (err) {
    res.render("sign-up", { user: req.session.user || null, error: "Something went wrong." });
  }
});

router.get("/log-in", (req, res) => {
  res.render("log-in", { user: req.session.user || null, error: null });
});
router.post("/log-in", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render("log-in", { user: req.session.user || null, error: "Invalid email or password." });
    }
    req.session.user = { email: user.email, firstName: user.firstName, role };
    if (role === "dataEntryClerk") {
      res.redirect("/inventory/list");
    } else {
      res.redirect("/cart");
    }
  } catch (err) {
    res.render("log-in", { user: req.session.user || null, error: "Something went wrong." });
  }
});


router.get("/welcome", isAuthenticated, (req, res) => {
  res.render("welcome", { user: req.session.user });
});


router.get("/cart", isAuthenticated, checkRole("customer"), (req, res) => {
  res.render("cart", { user: req.session.user });
});


router.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy(() => res.redirect("/log-in"));
});

module.exports = router;