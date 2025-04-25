const User = require("../models/User")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === "production") {
    options.secure = true
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    //add for frontend
    _id: user._id,
    name: user.name,
    email: user.email,
    //end for frontend
    token,
  })
}

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    // Validate name, email, password
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a name, email and password",
      })
    }

    // Validate email in correct format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" })
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" })
    }

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" })
    }

    // Check if role is "user" or "admin"
    if (role !== "user" && role !== "admin") {
      return res.status(400).json({ success: false, message: "Invalid role" })
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    })

    sendTokenResponse(user, 200, res)
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: "Server error. Please try again." })
  }
}

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      })
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid credentials" })
    }

    // check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" })
    }

    sendTokenResponse(user, 200, res)
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: "Server error. Please try again." })
  }
}

//@desc    Get current logged in user
//@route   POST /api/v1/auth/me
//@access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({
    success: true,
    data: user,
  })
}

//@desc   Logout user
//@route  GET /api/v1/auth/logout
//@access Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    data: {},
  })
}

//@desc    Send reset password link
//@route   POST /api/v1/auth/forgotpassword
//@access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes
    await user.save()

    const resetLink = `${process.env.BASE_URL}/resetpassword/${resetToken}`
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click on the link to reset your password: ${resetLink}`,
    }

    await transporter.sendMail(mailOptions)
    res.status(200).json({
      success: true,
      token: resetToken,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: "Server error. Please try again." })
  }
}

//@desc    reset password
//@route   POST /api/v1/auth/resetpassword
//@access  Public
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      console.log("User not found")
      return res.status(400).json({ success: false })
    }
    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()
    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: "Server error. Please try again." })
  }
}
