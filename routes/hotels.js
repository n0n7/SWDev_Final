const express = require("express")
const {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotels")

// Include other resource routers
// const appointmentRouter = require("./appointments")

const router = express.Router()

const { protect, authorize } = require("../middleware/auth")

// Re-route into other resource routers
// !TODO: implement later
// router.use("/:hotelId/rooms", ???)
// router.use("/:hotelId/bookings", ???)

router.route("/").get(getHotels).post(protect, authorize("admin"), createHotel)
router
  .route("/:id")
  .get(getHotel)
  .put(protect, authorize("admin"), updateHotel)
  .delete(protect, authorize("admin"), deleteHotel)

module.exports = router
