/**
 * Captain (Driver) Model Schema
 * Updated with KYC Verification, Payout Bank Account, and Earnings
 */

const mongoose = require('mongoose');

const captainSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Captain name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_trip'],
      default: 'inactive'
    },
    // Vehicle specifications
    vehicle: {
      vehicleType: {
        type: String,
        enum: ['bike', 'auto', 'cab_economy', 'cab_premium'],
        required: true
      },
      model: {
        type: String
      },
      color: {
        type: String,
        default: 'Black'
      },
      plate: {
        type: String,
        required: true,
        unique: true
      },
      capacity: {
        type: Number,
        default: 1
      }
    },
    // Driver KYC documents
    kycDocuments: {
      drivingLicense: { type: String },
      rcCertificate: { type: String },
      aadhaarCard: { type: String },
      insurancePolicy: { type: String }
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    // Payout details for daily withdrawals
    payoutDetails: {
      upiId: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String }
    },
    // Driver earnings & wallet
    earnings: {
      walletBalance: { type: Number, default: 0 },
      todayEarnings: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 }
    },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    rating: {
      type: Number,
      default: 5.0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Captain', captainSchema);
