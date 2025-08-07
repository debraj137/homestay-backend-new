const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  location: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  price: { type: Number, required: true },
  images: [{ type: String }],
  amenities: [{ type: String }],
  // maximumAllowedGuest: {type: Number,required: true,min: 1},
  maximumAllowedAdult: {type: Number,required: true,min: 1},
  maximumAllowedChild: {type: Number,required: true,min: 0},
  isApproved: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  category: {type: String,  enum: ['Normal', 'Silver', 'Gold', 'Diamond'],  default: 'Normal'},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
