const mongoose = require("mongoose")

const BookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: "hotel",
    required: true,
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "room",
    required: true,
  },
  createdAt: {
    type: Date,
    defailt: Date.now,
  },
})

module.exports = mongoose.model("Booking", BookingSchema)
