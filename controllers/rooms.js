const Room = require('../models/Room')
const Hotel = require('../models/Hotel')

//@ desc    Create room
//@ route   POST /api/v1/rooms
//@ access  Private

exports.createRoom = async (req, res, next) => {
    try {
        const room = await Room.create(req.body)

        res.status(201).json({
            success: true,
            data: room,
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ success: false })
    }
}

//@ desc    Update room
//@ route   PUT /api/v1/rooms/:roomId
//@ access  Private

exports.updateRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.roomId, req.body, {
            new: true,
            runValidators: true,
        })

        if (!room) {
            return res.status(400).json({ success: false })
        }

        res.status(200).json({ success: true, data: room })
    } catch (err) {
        res.status(400).json({ success: false })
    }
}

//@ desc    Delete room
//@ route   DELETE /api/v1/rooms/:roomId
//@ access  Private

exports.deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.roomId)

        if (!room) {
            return res.status(400).json({ success: false })
        }

        await room.remove()

        res.status(200).json({ success: true, data: {} })
    } catch (err) {
        res.status(400).json({ success: false })
    }
}

//@ desc    Get single room
//@ route   GET /api/v1/rooms/:roomId
//@ access  Public
exports.getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.roomId)

        if (!room) {
            return res.status(400).json({ success: false })
        }

        res.status(200).json({
            success: true,
            data: room,
        })
    } catch (err) {
        res.status(400).json({ success: false })
    }
}

//@ desc    Get all rooms
//@ route   GET /api/v1/rooms/:hotelId
//@ access  Public

// TODO: Add pagination and filtering (?)
exports.getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find({ hotel: req.params.hotelId })

        if (!rooms) {
            return res.status(400).json({ success: false })
        }

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms,
        })
    } catch (err) {
        res.status(400).json({ success: false })
    }
    
}