const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
//To be used only when checking if an id is valid, prior to making a DB call.

const Story = require("../models/Story.model");
const Tag = require("../models/Tag.model");

//  POST /stories/  -  Creates a new story
router.post("/", (req, res, next) => {
  const { body, private, signed, userId, tags } = req.body;
  const newStory = { body, private, signed, userId, tags };
  if (!userId && private) {
    // If there's no logged-in user, we need to create a uuid
    // in order to be able to link to the story.
    newStory.uuid = uuidv4();
  }
  Story.create(newStory)
    .then((response) => res.json(response))
    .catch((err) => {
      console.log("Error while creating the project", err);
      res.status(500).json({ message: "Error while creating the project" });
    });
});

module.exports = router;
