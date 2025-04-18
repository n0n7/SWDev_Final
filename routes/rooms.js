const express = require("express")

const {
    createRoom,
    updateRoom,
    deleteRoom,
    getRoom,
    getRooms,
} = require("../controllers/rooms")

const router = express.Router()

const { protect, authorize } = require("../middleware/auth")

// TODO: Protect and authorize routes

router.route("/").post(protect, authorize("admin"), createRoom)

router
    .route("/:roomId")
    .get(getRoom)
    .put(protect, authorize("admin"), updateRoom)
    .delete(protect, authorize("admin"), deleteRoom)

router.route("/:hotelId").get(getRooms)

module.exports = router