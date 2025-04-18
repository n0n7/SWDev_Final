const Booking = require("../models/Booking")
const Hotel = require("../models/Hotel")
const Room = require("../models/Room")
//@ desc    Create booking
//@ route   POST /api/v1/bookings
//@ access  Private

exports.createBooking = async (req, res, next) => {
    try {
        // check if hotel and room exist
        const hotelId = req.body.hotel
        const hotel = await Hotel.findById(hotelId)
        if (!hotel) {
            return res.status(400).json({ success: false })
        }

        const roomId = req.body.room
        const room = await Room.findById(roomId)
        if (!room) {
            return res.status(400).json({ success: false })
        }

        // check if room is in the hotel
        if(room.hotel.toString() !== hotelId) {
            return res.status(400).json({ success: false })
        }

        // check if booking is in the future
        const checkInDate = new Date(req.body.checkIn)
        const checkOutDate = new Date(req.body.checkOut)
        const currentDate = new Date()
        if (checkInDate < currentDate || checkOutDate < currentDate) {
            return res.status(400).json({ success: false })
        }

        // check if booking is valid (no more than 3 nights)
        if (checkInDate >= checkOutDate) {
            return res.status(400).json({ success: false })
        }
        const diffTime = Math.abs(checkOutDate - checkInDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays > 3) {
            return res.status(400).json({ success: false })
        }
        
        // check if room is available
        const overlapbookings = await Booking.find({
            room: roomId,
            checkIn: { $lt: req.body.checkOut },
            checkOut: { $gt: req.body.checkIn }, 
        })

        if (overlapbookings.length >= room.roomCount) {
            return res.status(400).json({ success: false })
        }

        // check if capacity is exceeded
        const totalGuests = req.body.guestCount
        const maxCapacity = room.maxCapacity
        if (totalGuests > maxCapacity) {
            return res.status(400).json({ success: false })
        }

        const booking = await Booking.create(req.body)

        res.status(201).json({
            success: true,
            data: booking,
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ success: false })
    }
}

//@ desc    Update booking
//@ route   PUT /api/v1/bookings/:id
//@ access  Private

exports.updateBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)

        if (!booking) {
            return res.status(400).json({ success: false })
        }

        // check if hotel and room exist
        const hotelId = req.body.hotel
        const hotel = await Hotel.findById(hotelId)
        if (!hotel) {
            return res.status(400).json({ success: false })
        }

        const roomId = req.body.room
        const room = await Room.findById(roomId)
        if (!room) {
            return res.status(400).json({ success: false })
        }

        // check if room is in the hotel
        if(room.hotel.toString() !== hotelId) {
            return res.status(400).json({ success: false })
        }

        // check if booking is in the future
        const checkInDate = new Date(req.body.checkIn)
        const checkOutDate = new Date(req.body.checkOut)
        const currentDate = new Date()
        if (checkInDate < currentDate || checkOutDate < currentDate) {
            return res.status(400).json({ success: false })
        }
        
        // check if booking is valid (no more than 3 nights)
        if (checkInDate >= checkOutDate) {
            return res.status(400).json({ success: false })
        }
        const diffTime = Math.abs(checkOutDate - checkInDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays > 3) {
            return res.status(400).json({ success: false })
        }
        
        // check if room is available
        const overlapbookings = await Booking.find({
            room: roomId,
            checkIn: { $lt: req.body.checkOut },
            checkOut: { $gt: req.body.checkIn }, 
        })

        if (overlapbookings.length >= room.roomCount) {
            return res.status(400).json({ success: false })
        }

        // check if capacity is exceeded
        const totalGuests = req.body.guestCount
        const maxCapacity = room.maxCapacity
        if (totalGuests > maxCapacity) {
            return res.status(400).json({ success: false })
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        res.status(200).json({
            success: true,
            data: updatedBooking,
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ success: false })
    }
}

//@ desc    Get all bookings
//@ route   GET /api/v1/bookings
//@ access  Private

exports.getBookings = async (req, res, next) => {
    try {
        let query
        if (req.user.role === "admin") {
            query = Booking.find()
        } else {
            query = Booking.find({ user: req.user.id })
        }

        const bookings = await query

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ success: false })
    }
}

//@ desc    Get single booking
//@ route   GET /api/v1/bookings/:id
//@ access  Private

exports.getBooking = async (req, res, next) => {
    try {
        // check if booking exists
        const booking = await Booking.findById(req.params.id)

        if (!booking) {
            return res.status(400).json({ success: false })
        }

        // check if user is authorized to view booking
        if (req.user.role !== "admin" && booking.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false })
        }

        res.status(200).json({
            success: true,
            data: booking,
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ success: false })
    }
}

//@ desc    Delete booking
//@ route   DELETE /api/v1/bookings/:id
//@ access  Private

exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)

        if (!booking) {
            return res.status(400).json({ success: false })
        }

        // check if user is authorized to delete booking
        if (req.user.role !== "admin" && booking.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false })
        }

        await booking.deleteOne()

        res.status(200).json({
            success: true,
            data: {},
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ success: false })
    }
}