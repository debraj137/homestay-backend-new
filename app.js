const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
app.use(express.json());
// const authRoute = require("../homestay-backend/route/auth.route");
const authRoute = require("../homestay-backend-copy/route/auth.route");
const adminRoute = require("../homestay-backend-copy/route/admin.route");
const bookingRoute = require("../homestay-backend-copy/route/booking.route");
const roomRoute = require("../homestay-backend-copy/route/room.route");
const reviewRoute = require("../homestay-backend-copy/route/review.route");
app.use(cors());
app.use("/auth", authRoute);
app.use("/rooms", roomRoute);
app.use("/bookings", bookingRoute);
app.use("/reviews", reviewRoute);
app.use("/admin", adminRoute);
mongoose.connect(process.env.DB_URL)
  .then(() => app.listen(process.env.PORT || 3000, () =>
    console.log('Server running')))
  .catch(err => console.log(err));



// const Room = require('../homestay-backend-copy/model/room.model')
// async function backfillMaximumGuests() {
//   const result = await Room.updateMany(
//     { category: { $exists: false } },
//     { $set: { category: "Normal" } }
//   );
//   console.log(`Backfilled ${result.modifiedCount} room(s) with max guests`);
// }

// backfillMaximumGuests();



