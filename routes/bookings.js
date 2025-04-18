const express = require("express");

const {
    createBooking,
    updateBooking,
    getBookings,
    getBooking,
    deleteBooking,
} = require("../controllers/bookings");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router
    .route("/")
    .post(protect, authorize("admin", "user"), createBooking)
    .get(protect, authorize("admin", "user"), getBookings);

router
    .route("/:id")
    .get(protect, authorize("admin", "user"), getBooking)
    .put(protect, authorize("admin", "user"), updateBooking)
    .delete(protect, authorize("admin", "user"), deleteBooking);

module.exports = router;