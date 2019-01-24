const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../config/keys");
const passport = require("passport");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load user model
const User = require("../../models/User");

// @route GET api/users/test
// @desc Tests users route
// @access Public

router.get("/test", (req, res) => res.json({ msg: "users works" }));

// @route GET api/users/register
// @desc Register users route
// @access Public

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    }
    const avatar = gravatar.url(req.body.email, {
      s: "200", //size
      r: "pg", //rating
      d: "mm" //default avatar
    });
    // var url = gravatar.url('emerleite@gmail.com', {s: '200', r: 'pg', d: '404'});
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      avatar,
      password: req.body.password
    });

    bcrypt.genSalt(10, (err, salt) => {
      //encryption of the password to save in db
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save() //this is the mongoose method to save the data
          .then(user => {
            res.json(user);
          })
          .catch(err => console.log(err));
      });
    });
  });
});

// @route GET api/users/login
// @desc login users / Returning JWT
// @access Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //  find user by email
  User.findOne({ email }).then(user => {
    // cheack user
    if (!user) {
      errors.email = "Email not found";
      return res.status(404).json(errors);
    }
    // check password
    bcrypt.compare(password, user.password).then(isMatch => {
      //this methid compares the password from the request with the password of the user with the email provided in the body
      if (isMatch) {
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };
        // user match
        jwt.sign(
          payload,
          key.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            if (err) throw err;
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password Incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route GET api/users/current
// @desc Returns current user with token/this is how we access the private route
// @access Private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
