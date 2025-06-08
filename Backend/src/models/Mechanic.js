const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mechanicSchema = new mongoose.Schema({
  rut: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pin: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['mechanic', 'admin'],
    default: 'mechanic'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para encriptar el PIN antes de guardar
mechanicSchema.pre('save', async function(next) {
  if (!this.isModified('pin')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar PINs
mechanicSchema.methods.comparePin = async function(candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};

const Mechanic = mongoose.model('Mechanic', mechanicSchema);

module.exports = Mechanic; 