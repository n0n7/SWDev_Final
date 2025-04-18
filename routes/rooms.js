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

router
    .route("/")
    .get(getRooms)
    .post(protect, authorize("admin"), createRoom)

router
    .route("/:roomId")
    .get(getRoom)
    .put(protect, authorize("admin"), updateRoom)
    .delete(protect, authorize("admin"), deleteRoom)

module.exports = router