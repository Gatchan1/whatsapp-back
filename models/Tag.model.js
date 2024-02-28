const { Schema, model } = require("mongoose");

const tagSchema = new Schema(
  {
    name: {
      type: String,
    },
    stories: [{ type: Schema.Types.ObjectId, ref: "Story" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Tag = model("Tag", tagSchema);

module.exports = Tag;
