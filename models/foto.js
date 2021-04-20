var mongoose = require('mongoose')
     
const fotoSchema = mongoose.Schema({
  name: {
    type: String
  },
  event: {
    type: String,
    default: ""
  },
  likes: {
    type: Array,
    default: [],
  },
  readyThumb: {
    type: Boolean,
    default: false
  },
  readyPrint: {
    type: Boolean,
    default: false
  },
  requestedPrint: {
    type: Boolean,
    default: false
  },			 
  available: {
    type: Boolean,
    default: true
  },
},
{autoCreate: true, timestamps: true})

fotoSchema.index({ name: 1, event: 1}, { unique: true , dropDups: true })

// Export foto model 
module.exports = mongoose.model('foto', fotoSchema)