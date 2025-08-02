const { sendEmail } = require('../utils/emailService');
const Room = require('../model/room.model');
const Booking = require('../model/booking.model');
const User = require('../model/user.model');
const fs = require('fs');
const path = require('path');
const templatePath = path.join(__dirname, '../emails/bookingConfirmationTemplate.html');
let emailHtml = fs.readFileSync(templatePath, 'utf-8');
// async function checkRoomAvailability(req, res) {
//   const { roomId, checkInDate, checkOutDate, guestCount } = req.body;
//   const room = await Room.findById(roomId).populate('ownerId');
//   if (!room) {
//     return res.status(404).json({ message: 'Room not found' });
//   }

//   // ✅ Validate guest count
//   if (guestCount > room.maximumAllowedGuest) {
//     return res.status(400).json({
//       message: `Guest count exceeds allowed limit. Max allowed: ${room.maximumAllowedGuest}`
//     });
//   }


//   if (!checkInDate || !checkOutDate) {
//     return res.status(400).json({ message: 'Check-in and check-out dates are required.' });
//   }

//   if (new Date(checkInDate).getTime() >= new Date(checkOutDate).getTime()) {
//     return res.status(400).json({
//       message: `Check-in date must be before check-out date`
//     });
//   }

//   //New implementation to check for overlapping bookings
//   const latestBooking = await Booking.find({
//     roomId: roomId,
//     checkInDate: { $lt: checkOutDate },
//     checkOutDate: { $gt: checkInDate }
//   }).sort({ checkOutDate: -1 }).limit(1);
//   console.log('latestBooking: ', latestBooking);
//   if (latestBooking.length > 0) {
//     const today = new Date();
//     const bookedFrom = new Date(latestBooking[0].checkInDate);
//     const bookedTo = new Date(latestBooking[0].checkOutDate);

//     const nextAvailable = new Date(bookedTo);
//     nextAvailable.setDate(nextAvailable.getDate() + 1); // day after booking ends

//     let availableBeforeBooking = null;

//     if (today < bookedFrom) {
//       const beforeBookingTo = new Date(bookedFrom); // clone
//       beforeBookingTo.setDate(beforeBookingTo.getDate() - 1);

//       // Only if from date is before to date
//       if (today <= beforeBookingTo) {
//         const adjustedBeforeBookingTo = new Date(beforeBookingTo);
//         adjustedBeforeBookingTo.setDate(adjustedBeforeBookingTo.getDate() + 1);
//         availableBeforeBooking = {
//           from: formatDate(today),
//           // to: formatDate(beforeBookingTo)
//           to: formatDate(adjustedBeforeBookingTo)
//         };
//       }
//     }
//     const adjustedBookedFrom = new Date(bookedFrom);
//     adjustedBookedFrom.setDate(adjustedBookedFrom.getDate() + 1);

//     const adjustedBookedTo = new Date(bookedTo);
//     adjustedBookedTo.setDate(adjustedBookedTo.getDate() - 1);
//     nextAvailable.setDate(nextAvailable.getDate() - 1);

//       return res.status(400).json({
//         success: false,
//         message: `Room is not available from ${formatDate(adjustedBookedFrom)} to ${formatDate(adjustedBookedTo)}.`,
//         nextAvailableCheckIn: formatDate(nextAvailable),
//         availableBeforeBooking
//       });
//   }




//   // Utility
//   function formatDate(date) {
//     return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
//   }

//   // ✅ Room is available
//   return res.status(200).json({
//     success: true,
//     message: 'Room is available for the selected dates.',
//     roomDetails: {
//       title: room.title,
//       description: room.description,
//       location: room.location,
//       price: room.price,
//       maximumAllowedGuest: room.maximumAllowedGuest,
//       amenities: room.amenities,
//       owner: {
//         name: room.ownerId.name,
//         email: room.ownerId.email,
//         mobileNumber: room.ownerId.mobileNumber
//       }
//     }
//   });
// }


async function checkRoomAvailability(req, res) {
  console.log('checkRoomAvailability in req body: ', req.body)
  const { roomId, checkInDate, checkOutDate, guestCount } = req.body;
  const room = await Room.findById(roomId).populate('ownerId');
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  // ✅ Validate guest count
  if (guestCount > room.maximumAllowedGuest) {
    return res.status(400).json({
      message: `Guest count exceeds allowed limit. Max allowed: ${room.maximumAllowedGuest}`
    });
  }

  if (!checkInDate || !checkOutDate) {
    return res.status(400).json({ message: 'Check-in and check-out dates are required.' });
  }


  const normalize = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
  const normalizedCheckInDate = normalize(checkInDate);
  const normalizedCheckOutDate = normalize(checkOutDate);

  if (normalizedCheckInDate.getTime() >= normalizedCheckOutDate.getTime()) {
    return res.status(400).json({
      message: `Check-in date must be before check-out date`
    });
  }

  //New implementation to check for overlapping bookings
  const latestBooking = await Booking.find({
    roomId: roomId,
    checkInDate: { $lt: normalizedCheckOutDate },
    checkOutDate: { $gt: normalizedCheckInDate }
  }).sort({ checkOutDate: -1 }).limit(1);
  console.log('latestBooking: ', latestBooking);
  // if (latestBooking.length > 0) {
  //   const today = normalize(new Date());
  //   const bookedFrom = normalize(latestBooking[0].checkInDate);
  //   const bookedTo = normalize(latestBooking[0].checkOutDate);

  //   const nextAvailable = new Date(bookedTo);
  //   nextAvailable.setDate(nextAvailable.getDate() + 1); // day after booking ends

  //   let availableBeforeBooking = null;

  //   if (today < bookedFrom) {
  //     const beforeBookingTo = new Date(bookedFrom); // clone
  //     beforeBookingTo.setDate(beforeBookingTo.getDate() - 1);

  //     // Only if from date is before to date
  //     if (today <= beforeBookingTo) {
  //       const adjustedBeforeBookingTo = new Date(beforeBookingTo);
  //       adjustedBeforeBookingTo.setDate(adjustedBeforeBookingTo.getDate() + 1);
  //       availableBeforeBooking = {
  //         from: formatDate(today),
  //         // to: formatDate(beforeBookingTo)
  //         to: formatDate(adjustedBeforeBookingTo)
  //       };
  //     }
  //   }
  //   const adjustedBookedFrom = new Date(bookedFrom);
  //   adjustedBookedFrom.setDate(adjustedBookedFrom.getDate() + 1);

  //   const adjustedBookedTo = new Date(bookedTo);
  //   adjustedBookedTo.setDate(adjustedBookedTo.getDate() - 1);
  //   nextAvailable.setDate(nextAvailable.getDate() - 1);
  //   console.log('normalizedCheckInDate.getTime(): ', normalizedCheckInDate.getTime());
  //   console.log('bookedTo.getTime(): ', bookedTo.getTime());
  //   return res.status(400).json({
  //     success: false,
  //     message: `Room is not available from ${formatDate(adjustedBookedFrom)} to ${formatDate(adjustedBookedTo)}.`,
  //     nextAvailableCheckIn: formatDate(nextAvailable),
  //     availableBeforeBooking
  //   });
  // }

  if (latestBooking.length > 0) {
    const booking = latestBooking[0];
    const bookingCheckIn = normalize(booking.checkInDate);
    const bookingCheckOut = normalize(booking.checkOutDate);

    // Check for real overlap
    const isOverlapping =
      normalizedCheckInDate < bookingCheckOut &&
      normalizedCheckOutDate > bookingCheckIn;

    if (isOverlapping) {
      const today = normalize(new Date());

      const adjustedBookedFrom = new Date(bookingCheckIn);
      adjustedBookedFrom.setDate(adjustedBookedFrom.getDate() + 1);

      const adjustedBookedTo = new Date(bookingCheckOut);
      adjustedBookedTo.setDate(adjustedBookedTo.getDate() - 1);

      const nextAvailable = new Date(bookingCheckOut);

      let availableBeforeBooking = null;
      if (today < bookingCheckIn) {
        const beforeBookingTo = new Date(bookingCheckIn);
        beforeBookingTo.setDate(beforeBookingTo.getDate() - 1);

        if (today <= beforeBookingTo) {
          const adjustedBeforeBookingTo = new Date(beforeBookingTo);
          adjustedBeforeBookingTo.setDate(adjustedBeforeBookingTo.getDate() + 1);

          availableBeforeBooking = {
            from: formatDate(today),
            to: formatDate(adjustedBeforeBookingTo),
          };
        }
      }

      nextAvailable.setDate(nextAvailable.getDate()); // no adjustment needed

      return res.status(400).json({
        success: false,
        message: `Room is not available from ${formatDate(adjustedBookedFrom)} to ${formatDate(adjustedBookedTo)}.`,
        nextAvailableCheckIn: formatDate(nextAvailable),
        availableBeforeBooking,
      });
    }
  }



  // Utility
  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // ✅ Room is available
  // console.log('normalizedCheckInDate.getTime(): ', normalizedCheckInDate.getTime());
  // console.log('bookedTo.getTime(): ', bookedTo.getTime());
  // if (normalizedCheckInDate.getTime() === bookedTo.getTime()) {
  return res.status(200).json({
    success: true,
    message: 'Room is available for the selected dates.',
    roomDetails: {
      title: room.title,
      description: room.description,
      location: room.location,
      price: room.price,
      maximumAllowedGuest: room.maximumAllowedGuest,
      amenities: room.amenities,
      owner: {
        name: room.ownerId.name,
        email: room.ownerId.email,
        mobileNumber: room.ownerId.mobileNumber
      }
    }
  });
  // }
}








async function createBooking(req, res) {
  try {
    const { userId, roomId, checkInDate, checkOutDate, guestCount, totalPrice, mobileNumber } = req.body;
    const room = await Room.findById(roomId).populate('ownerId');
    const user = await User.findById(userId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Proceed to create booking if available
    const booking = new Booking({
      userId,
      roomId,
      guestCount,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'confirmed',
      mobileNumber
      // mobileNumber: user.mobileNumber, // ✅ NEW,
    });

    await booking.save();
    const bookingDetails = `
      <h2>Booking Details</h2>
      <p><strong>Room:</strong> ${room.title}</p>
      <p><strong>Location:</strong> ${room.location.city}</p>
      <p><strong>Check-In:</strong> ${checkInDate}</p>
      <p><strong>Check-Out:</strong> ${checkOutDate}</p>
      <p><strong>Guest Count:</strong> ${guestCount}</p>
      <p><strong>Total Price:</strong> ₹${totalPrice}</p>
    `;

    const userDetails = `
      <h2>User Details</h2>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Mobile:</strong> ${user.mobileNumber}</p>
    `;
    emailHtml = emailHtml
      .replace('{{recipientName}}', user.name)
      .replace('{{roomTitle}}', room.title)
      .replace('{{roomLocation}}', room.location.city)
      .replace('{{checkInDate}}', checkInDate)
      .replace('{{checkOutDate}}', checkOutDate)
      .replace('{{guestCount}}', guestCount)
      .replace('{{totalPrice}}', totalPrice)
      .replace('{{userName}}', user.name)
      .replace('{{userEmail}}', user.email)
    console.log('user.email: ', user.email);
    console.log('room.ownerId.email: ', room.ownerId.email);
    // Send emails
    // await sendEmail(user.email, 'Booking Confirmation', bookingDetails + userDetails);
    // await sendEmail(room.ownerId.email, 'New Booking for Your Room', userDetails + bookingDetails); 
    await sendEmail(user.email, 'Booking Confirmation', emailHtml);
    await sendEmail(room.ownerId.email, 'Booking Confirmation', emailHtml);

    res.status(201).json({ message: 'Booking created and emails sent', booking });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

async function getUserBookings(req, res) {
  // console.log('req in getUserBookings: ',req);
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).populate('roomId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

async function getAllBooking(req, res) {
  try {
    const bookings = await Booking.find()
      .populate('roomId')  // Already populated
      .populate('userId', 'name email') // 👈 Only fetch name & email of user
      .exec();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

async function getBookingsForRoom(req, res) {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ message: 'roomId is required' });
    }

    const bookings = await Booking.find({ roomId }).select('checkInDate checkOutDate');
    res.json(bookings);
  } catch (err) {
    // console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

async function getOwnerRoomBooking(req, res) {
  // console.log('req: ',req);
  try {
    const ownerId = req.user.userId; // Assuming `verifyToken` adds the user
    // console.log('ownerId: ',ownerId)
    // Step 1: Get all rooms owned by the logged-in owner
    const ownerRooms = await Room.find({ ownerId });
    // console.log('ownerRooms: ',ownerRooms);
    // Step 2: Extract room IDs
    const roomIds = ownerRooms.map(room => room._id);

    // Step 3: Get bookings for those rooms
    const bookings = await Booking.find({ roomId: { $in: roomIds } })
      .populate('roomId')
      .populate('userId');

    res.json({ bookings, ownerRooms });
  } catch (error) {
    // console.error('Owner Booking Fetch Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { checkRoomAvailability, createBooking, getUserBookings, getBookingsForRoom, getOwnerRoomBooking, getAllBooking }