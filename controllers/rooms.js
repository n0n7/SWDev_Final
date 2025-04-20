const Room = require('../models/Room')
const Hotel = require('../models/Hotel')

//@ desc    Create room
//@ route   POST /api/v1/rooms
//@ access  Private

exports.createRoom = async (req, res, next) => {
    try {
        const roomsData = req.body.rooms

        if (!Array.isArray(roomsData) || roomsData.length === 0) {
            return res.status(400).json({ success: false, message: 'Rooms data must be a non-empty array' })
        }

        // Make sure all rooms have the same hotel and that hotel exists
        const hotelId = roomsData[0].hotel
        const hotel = await Hotel.findById(hotelId)

        if (!hotel) {
            return res.status(400).json({ success: false, message: 'Hotel not found' })
        }

        const allSameHotel = roomsData.every(room => room.hotel === hotelId)
        if (!allSameHotel) {
            return res.status(400).json({ success: false, message: 'All rooms must belong to the same hotel' })
        }

        const rooms = await Room.insertMany(roomsData)

        res.status(201).json({
            success: true,
            data: rooms,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false })
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
        res.status(500).json({ success: false })
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

        await room.deleteOne()

        res.status(200).json({ success: true, data: {} })
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false })
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
        res.status(500).json({ success: false })
    }
}

//@ desc    Get all rooms
//@ route   GET /api/v1/rooms
//@ access  Public

exports.getRooms = async (req, res, next) => {
    try {
        let query

        // if hotelId is in the query, filter by hotelId
        if (req.query.hotelId) {
            query = { hotel: req.query.hotelId }
        } else {
            query = {}
        }

        // get all rooms
        const rooms = await Room.find(query).populate('hotel')

        if (!rooms) {
            return res.status(400).json({ success: false })
        }

        res.status(200).json({
            success: true,
            data: rooms,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false })
    }
}