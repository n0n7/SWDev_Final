const mongoose = require("mongoose")

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    hotel: {
      type: mongoose.Schema.ObjectId,
      ref: "Hotel",
      required: true,
    },
    maxCapacity: {
      type: Number,
      required: [true, "Please add a max capacity"],
    },
    roomCount: {
      type: Number,
      required: [true, "Please add a room count"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)
// Reverse populate with virtuals
RoomSchema.virtual("booking", {
  ref: "booking",
  localField: "_id",
  foreignField: "room",
  justOne: false,
})

module.exports = mongoose.model("Room", RoomSchema)
