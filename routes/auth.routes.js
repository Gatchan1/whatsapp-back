const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const isAuthenticated = require("../middleware/jwt.middleware.js");
const saltRounds = 10;

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
  const { email, password, passwordRepeat, name } = req.body;

  if (email === "" || password === "" || passwordRepeat === "" || name === "") {
    res.status(400).json({ message: "Please fill all fields" });
    return;
  }

  if (password != passwordRepeat){
    res.status(400).json({ message: "Passwords should match!" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  //const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  const passwordRegex = /.*/; //TODO
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message: "Password must have at least 8 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: "This email address is already in use." });
        return;
      }
      return User.findOne({name})
    })
    .then((foundUser) =>{
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }
      // If both username and email are unique, proceed to hash password & create user
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      return User.create({ email, password: hashedPassword, name });
    })
    .then((createdUser) => {
      const { email, name, _id } = createdUser;
      const user = { email, name, _id };

      // Send a json response containing the user object (obviously without displaying the password)
      res.status(201).json({ user: user });
    })
    .catch((err) => next(err));
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", (req, res, next) => {
  const { user, password } = req.body;
  let email, name;

  if (user === "" || password === "") {
    res.status(400).json({ message: "Provide username (or email) and password." });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (emailRegex.test(user)) {
    userQuery = {email: user}
  } else {
    userQuery = {name: user}
  } 

  // Check the users collection if a user with the same username or email exists
  User.findOne(userQuery)
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found." });
        return;
      }
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { _id, email, name } = foundUser;

        const payload = { _id, email, name };

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "24h",
        });

        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err));
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

module.exports = router;
