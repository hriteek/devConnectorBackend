const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load validator
const validatePostInput = require("../../validation/post");

// Post model
const Post = require("../../models/Post");
// Profile model
const Profile = require("../../models/Profile");

// @route GET api/posts/test
// @desc Tests posts route
// @access Public
router.get("/test", (req, res) => res.json({ msg: "posts works" }));

// @route GET api/posts
// @desc Get  posts
// @access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

// @route GET api/posts/:id
// @desc Get  post by id
// @access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found for the given id" })
    );
});

// @route POST api/posts
// @desc Create  posts
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      res.status(400).json(errors);
    }
    //   create a Post instance and save it to the db
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

// @route DELETE api/posts/:id
// @desc Delete post by id
// @access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // check for the post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorizes: "User not authorized" });
          }
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotFound: "Post not found" }));
    });
  }
);

// @route POST api/posts/like/:id
// @desc Like post
// @access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check whether the user have liked previously
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            res
              .status(400)
              .json({ alreadyLIked: "User already liked this post" });
          }
          // Add current user to the likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotFound: "No post found" }));
    });
  }
);

// @route POST api/posts/unlike/:id
// @desc Unlike post
// @access Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check whehter the user have liked the post or not
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            res
              .status(400)
              .json({ notlikes: "You have not yet liked this post" });
          }
          // find the index of the user like from the likes array
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // perform the splice mehod on likes array to remove the user liked index
          post.likes.splice(removeIndex, 1);

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotFound: "Post not found" }));
    });
  }
);

module.exports = router;
