const mongoose = require('mongoose');

let BikesStationSchema = new mongoose.Schema({
  "name": {
    type: String
  },
  "number": {
    type: Number
  },
  "last_update": {
    type: Number,
  }
});
// let BikesStation = mongooseDublinBikes.model('Station', BikesStationSchema);
module.exports = BikesStationSchema;