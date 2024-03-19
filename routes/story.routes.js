const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const isAuthenticated = require("../middleware/jwt.middleware"); // falta incorporarlo
const mongoose = require("mongoose");
// ⭡⭡ To be used only when checking if an id is valid, prior to making a DB call.

const Story = require("../models/Story.model");
const Tag = require("../models/Tag.model");

//  POST /story/  -  Creates a new story
router.post("/", (req, res, next) => {
  const { body, private, signed, userId, tags } = req.body;
  const newStory = { body, private, signed, userId, tags };
  if (!userId && private) {
    // If there's no logged-in user, we need to create a uuid
    // in order to be able to link to the story.
    newStory.uuid = uuidv4();
  }
  Story.create(newStory)
    .then((response) => {
      req.createdStory = response;
      if (tags[0]) {
        const tagsUpdates = tags.map((tag) => Tag.findByIdAndUpdate(tag, { $push: { stories: response._id } }));
        return Promise.all(tagsUpdates);
      }
      return response;
    })
    .then(() => res.json(req.createdStory))
    .catch((err) => {
      console.log("Error while creating the story", err);
      res.status(500).json({ message: "Error while creating the story" });
    });
});

// PATCH /story/:storyId/body  -  Update a story (body, tags)
router.patch("/:storyId/body", (req, res, next) => {
  const { storyId } = req.params;
  const { body, tags } = req.body;
  const updatedStory = { body, tags };

  if (!tags) {
    console.log("no he incluido taaags");
    Story.findByIdAndUpdate(storyId, updatedStory)
      .then(() => res.json("Story updated correctly."))
      .catch((err) => {
        console.log("Error while updating the story", err);
        res.status(500).json({ message: "Error while updating the story" });
      });
  } else {
    Story.findByIdAndUpdate(storyId, updatedStory)
      .then((response) => {
        const oldTags = JSON.parse(JSON.stringify(response.tags));
        const excludedTags = oldTags.filter((oldTag) => !tags.includes(oldTag));
        const includedTags = tags.filter((newTag) => !oldTags.includes(newTag));
        const excludePromises = excludedTags.map((excludedTag) => Tag.findByIdAndUpdate(excludedTag, { $pull: { stories: storyId } }));
        const includePromises = includedTags.map((includedTag) => Tag.findByIdAndUpdate(includedTag, { $push: { stories: storyId } }));
        return Promise.all([...excludePromises, ...includePromises]);
      })
      .then(() => res.json("Story updated correctly"))
      .catch((err) => {
        console.log("Error while updating the story", err);
        res.status(500).json({ message: "Error while updating the story" });
      });
  }
});

// PATCH /story/:storyId/visibility  -  Update a story (visibility)
router.patch("/:storyId/visibility", (req, res, next) => {
  // (A PATCH route for a tickbox that swaps between private/public)
  const { storyId } = req.params;
  const { private } = req.body;
  const updatedStory = { private };
  Story.findByIdAndUpdate(storyId, updatedStory, { new: true })
    .then((response) => res.json(response))
    .catch((err) => {
      console.log("Error while updating the story", err);
      res.status(500).json({ message: "Error while updating the story" });
    });
});

// PATCH /story/:storyId/uuid  -  Update a story (uuid)
router.patch("/:storyId/uuid", (req, res, next) => {
  // Will create or destroy a uuid.
  // I mean if you're a logged in user and the story is set to private,
  // then the "shareability" is up to whether or not the uuid exists or not.
  const { storyId } = req.params;

  Story.findById(storyId)
    .then((story) => {
      if (!story.uuid) {
        const uuid = uuidv4();
        return Story.findByIdAndUpdate(storyId, { uuid }, { new: true });
      } else {
        return Story.findByIdAndUpdate(storyId, { uuid: "" }, { new: true });
      }
    })
    .then((resp) => res.json(resp))
    .catch((err) => {
      console.log("Error while managing the share link", err);
      res.status(500).json({ message: "Error while managing the share link" });
    });
});

// DELETE /story/:storyId  -  Delete a story
router.delete("/:storyId", (req, res, next) => {
  const { storyId } = req.params;

  Story.findByIdAndDelete(storyId)
    .then((response) => {
      req.deletedStory = response;
      if (response.tags && response.tags[0]) {
        const tags = JSON.parse(JSON.stringify(response.tags));
        const tagsUpdates = tags.map((tag) => Tag.findByIdAndUpdate(tag, { $pull: { stories: response._id } }));
        return Promise.all(tagsUpdates);
      }
      return response;
    })
    .then(() => res.json(req.deletedStory))
    .catch((err) => {
      console.log("Error while deleting story", err);
      res.status(500).json({ message: "Error while deleting story" });
    });
});

// GET /story/:storyId  -  Get a single story (public)
router.get("/:storyId", (req, res, next) => {
  const { storyId } = req.params;

  Story.findById(storyId)
    .then((resp) => res.json(resp))
    .catch((err) => {
      console.log("Error while retrieving story", err);
      res.status(500).json({ message: "Error while retrieving story" });
    });
});

// GET /story/:uuid/link  -  Get a single story (private)
router.get("/:uuid/link", (req, res, next) => {
  const { uuid } = req.params;

  Story.findOne({ uuid })
    .then((resp) => res.json(resp))
    .catch((err) => {
      console.log("Error while retrieving story", err);
      res.status(500).json({ message: "Error while retrieving story" });
    });
});

module.exports = router;
