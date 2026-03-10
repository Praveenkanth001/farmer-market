// backend/models/Trip.js
const tripSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleNumber: String,
  totalCapacity: Number, // e.g., 1000 kg
  availableCapacity: Number, // e.g., starts at 1000, drops as farmers book
  route: {
    fromDistrict: String, // e.g., "Hisar"
    toMarket: String      // e.g., "Azadpur Mandi"
  },
  stops: [
    {
      farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      pickupLocation: { type: [Number], index: '2dsphere' }, // [long, lat]
      quantity: Number // e.g., 200 kg
    }
  ],
  status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' },
  departureTime: Date
});
