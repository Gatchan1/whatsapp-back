const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const isAuthenticated = require("../middleware/jwt.middleware");
const mongoose = require("mongoose");
// ⭡⭡ To be used only when checking if an id is valid, prior to making a DB call.

const Story = require("../models/Story.model");
const Tag = require("../models/Tag.model");

//TODO: limit searches to 50 results & return pagination info!!
//might put captcha for when non logged-in user makes DB request


// GET /stories/  -  get ALL PUBLIC stories (no need to be logged in).
router.get("/", (req, res, next) => {

  Story.find({ private: false })
    .then((resp) => res.json(resp))
    .catch((err) => {
      console.log("Error while retrieving stories", err);
      res.status(500).json({ message: "Error while retrieving stories" });
    });
});

// GET /stories/user/self  - get EVERY story of your OWN ACCOUNT (public + private)
//                          (PROTECTED, need to be logged in).
router.get("/user/self", isAuthenticated, (req, res, next) => { // TODO: test this route!!
  const selfId = req.payload.userId;

  Story.find({ userId: selfId })
    .then((resp) => res.json(resp))
    .catch((err) => {
      console.log("Error while retrieving stories", err);
      res.status(500).json({ message: "Error while retrieving stories" });
    });
});

// GET /stories/user/:userId  -  Get every PUBLIC story of a user (no need to be logged in).
router.get("/user/:userId", (req, res, next) => {
  const { userId } = req.params;

  Story.find({ $and: [{ userId }, { private: false }, { signed: true }] })
  //only (signed && public) stories belonging to a specific userId.
    .then((resp) => res.json(resp))
    .catch((err) => {
      console.log("Error while retrieving stories", err);
      res.status(500).json({ message: "Error while retrieving stories" });
    });
});

// GET /stories/tag/:tagId  -  Get every PUBLIC story that matches a tag (no need to be logged in).
/*                             In order to also see your OWN private stories added they will come from
 *                             the GET "/stories/user/self" call.  */
router.get("/tag/:tagId", (req, res, next) => { // TODO: test this route!!
  const { tagId } = req.params;
  
  Tag.findById(tagId)
    .then((resp) => res.json(resp))
    .catch((err) => {
      console.log("Error while retrieving stories", err);
      res.status(500).json({ message: "Error while retrieving stories" });
    });
});

module.exports = router;
