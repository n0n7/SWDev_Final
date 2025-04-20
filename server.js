const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const mongoSanitizer = require("express-mongo-sanitize")
const helmet = require("helmet")
const { xss } = require("express-xss-sanitizer")
// const rateLimit = require("express-rate-limit")

const swaggerJsDoc = require("swagger-jsdoc")
const swaggerUI = require("swagger-ui-express")

dotenv.config({ path: "./config/config.env" })

const connectDB = require("./config/db")

// Route files
const hotels = require("./routes/hotels")
const auth = require("./routes/auth")
const bookings = require("./routes/bookings")
const rooms = require("./routes/rooms")

// connect to database
connectDB()

const app = express()

// security
app.use(helmet())

// Body parser
app.use(express.json())
app.use(mongoSanitizer())
app.use(xss())

// // Rate Limiting
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 1,
// })
// app.use(limiter)

// Cookie parser
app.use(cookieParser())

// cors
app.use(cors())

// Mount routers
app.use("/api/v1/hotels", hotels)
app.use("/api/v1/auth", auth)
app.use("/api/v1/bookings", bookings)
app.use("/api/v1/rooms", rooms)

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs))

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`)
  server.close(() => process.exit(1))
})
