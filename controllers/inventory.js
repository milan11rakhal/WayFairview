const express = require("express");
const router = express.Router();


function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/log-in");
}

function isAuthenticatedClerk(req, res, next) {
  if (req.session.user && req.session.user.role === "dataEntryClerk") return next();
  res.status(401).render("error", { user: req.session.user || null, message: "You are not authorized to view this page." });
}

const products = [
  { id: 1, name: "Laptop", price: 999.99, description: "A high-performance laptop." },
  { id: 2, name: "Smartphone", price: 499.99, description: "Latest model with great features." },
  { id: 3, name: "Headphones", price: 79.99, description: "Noise-canceling headphones." },
];

router.get("/", isAuthenticated, (req, res) => {
  res.render("inventory", { user: req.session.user, products });
});

router.get("/list", isAuthenticated, isAuthenticatedClerk, (req, res) => {
  res.render("list", { user: req.session.user });
});

module.exports = router;