import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // Who created this order
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Which operator accepted it (null until accepted)
  assignedOperator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Object being shipped
  objectName: {
    type: String,
    required: [true, 'Please add an object name'],
  },

  // Locations
  fromLocation: {
    type: String,
    required: [true, 'Please add pickup location'],
  },
  toLocation: {
    type: String,
    required: [true, 'Please add delivery location'],
  },

  // Distance in km
  distance: {
    type: Number,
    default: 0,
  },

  // Status
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'On The Way', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },

  // Status history
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  }],

}, { timestamps: true });

// Generate unique tracking ID
shipmentSchema.statics.generateTrackingId = async function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let trackingId;
  let exists = true;
  
  while (exists) {
    const numPart = Array.from({ length: 4 }, () => nums[Math.floor(Math.random() * nums.length)]).join('');
    const charPart = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    trackingId = `SHP-${numPart}-${charPart}`;
    exists = await this.findOne({ trackingId });
  }
  
  return trackingId;
};

export default mongoose.model('Shipment', shipmentSchema);
