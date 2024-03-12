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
      console.log("Error while creating the story", err);
      res.status(500).json({ message: "Error while creating the story" });
    });
});

// PATCH /stories/:storyId/body  -  Update a story (body)
router.patch("/:storyId/body", (req, res, next) => {
  const {storyId} = req.params;
  const { body, tags } = req.body;
  const updatedStory = { body, tags };
  Story.findByIdAndUpdate(storyId, updatedStory)
    .then((response) => res.json(response))
    .catch((err) => {
      console.log("Error while updating the story", err);
      res.status(500).json({ message: "Error while updating the story" });
    });
})

// (A PATCH route for a tickbox that swaps between private/public vvvvv)
// PATCH /stories/:storyId/privacity  -  Update a story (privacity)
router.patch("/:storyId/privacity", (req, res, next) => {
  const {storyId} = req.params;
  const { private } = req.body;
  const updatedStory = { private };
  Story.findByIdAndUpdate(storyId, updatedStory)
    .then((response) => res.json(response))
    .catch((err) => {
      console.log("Error while updating the story", err);
      res.status(500).json({ message: "Error while updating the story" });
    });
})

// PATCH /stories/:storyId/uuid  -  Update a story (uuid)
router.patch("/:storyId/uuid", (req, res, next) => {
  // Will create or destroy a uuid.
  // I mean if you're a logged in user and the story is set to private,
  // then the "shareability" is up to whether or not the uuid exists or not.
  const {storyId} = req.params;

  Story.findById(storyId)
  .then((story) => {
    if (!story.uuid) {
      const uuid = uuidv4();
      return Story.findByIdAndUpdate(storyId, {uuid})
    } else {
      return Story.findByIdAndUpdate(storyId, {uuid: ""})
    }
  })
  .then((resp) => res.json(resp))
  .catch((err) => {
    console.log("Error while managing the share link", err);
    res.status(500).json({ message: "Error while managing the share link" });
  });
})


module.exports = router;
