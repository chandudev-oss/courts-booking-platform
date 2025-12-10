const mongoose = require("mongoose");

const CourtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    imageURL: {
      type: String,
      required: true
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },

    ratingCount: {
      type: Number,
      default: 0
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    type: {
      type: String,
      enum: ["indoor", "outdoor"],
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Court", CourtSchema);
