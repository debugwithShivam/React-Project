/**
 * Ride Model Schema
 * Updated with Scheduled rides, Digital Receipt breakdown, and Rating feedback
 */

const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Captain'
    },
    pickup: {
      address: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number }
    },
    destination: {
      address: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number }
    },
    vehicleType: {
      type: String,
      enum: ['bike', 'auto', 'cab_economy', 'cab_premium', 'parcel'],
      required: true
    },
    fare: {
      type: Number,
      required: true
    },
    // Scheduled Ride fields
    isScheduled: {
      type: Boolean,
      default: false
    },
    scheduledDate: {
      type: String
    },
    scheduledTime: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
      default: 'pending'
    },
    duration: {
      type: Number // in seconds or minutes
    },
    distance: {
      type: Number // in kilometers
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'wallet'],
      default: 'upi'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    // Digital Receipt itemized breakdown
    receipt: {
      baseFare: { type: Number },
      distanceFare: { type: Number },
      tax: { type: Number },
      discount: { type: Number, default: 0 },
      totalPaid: { type: Number }
    },
    // Rating & Feedback
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    reviewTags: [
      {
        type: String
      }
    ],
    otp: {
      type: String,
      select: false,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ride', rideSchema);
