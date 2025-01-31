const { Schema, model } = require("mongoose");

const storySchema = new Schema(
  {
    body: {
      type: String,
      required: [true, "Some text is required."],
    },
    pov: {
      type: String,
    },
    uuid: {
      type: String,
    },
    private: {
      type: Boolean,
      default: true,
    },
    signed: {
      type: Boolean,
      //if logged-in user: 
      //    story private: signed == false;
      //    story !private: user chooses signed true/false.
      //if unlogged-in user: can only be false.
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Story = model("Story", storySchema);

module.exports = Story;
