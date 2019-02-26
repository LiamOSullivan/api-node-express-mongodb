const express = require('express');
const path = require('path');
var cron = require("node-cron");
require('dotenv').config();


const router = express.Router();
const index = require('./routes/index');
const api = require('./routes/api');

const app = express();
const PORT = 3001;
app.listen(PORT, function() {
  console.log('Listening on port ' + PORT);
})

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', index);
app.use('/api', api);

let connections = require('./database/connections');

let census2016Connection = connections.census2016Connection;
census2016Connection.on('connected', function() {
  console.log("Connected to Census2016 MongoDB Database");
});
census2016Connection.on('error', console.error.bind(console, 'Census 2016 MongoDB connection error:'));

//dublinbikes database connection and data model setup
let dublinBikesConnection = connections.dublinBikesConnection;
dublinBikesConnection.on('connected', function() {
  console.log("Connected to Dublin Bikes MongoDB Database");
});
dublinBikesConnection.on('error', console.error.bind(console, 'Dublin Bikes MongoDB connection error:'));
let BikesStationSchema = require('./models/dublinbikes');
let Station = dublinBikesConnection.model('Station', BikesStationSchema);

//Hourly trend data- rewritten every day
let bikesByHour;
// cron.schedule("12 */1 * * *", function() {
cron.schedule("*/1 * * * *", function() {
  let http = require('https');
  let fs = require('fs');

  let fileName = "bikesData-" + new Date().getHours() + ".json";
  bikesByHour = fs.createWriteStream("./public/data/transport/" + fileName);
  http.get("https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=" + process.env.BIKES_API_KEY, function(response, error) {
    if (error) {
      return console.log(">>>Error on bikes trend GET\n");
    };
    //save to file
    response.pipe(bikesByHour);
    //upload to MongoDB


  });



});

let hour = new Date().getHours();
let min = new Date().getMinutes();
console.log("CRUD App started at " + hour + ":" + min);