var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/geoDb');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Mongo connected');
});

var dbSchema = mongoose.Schema({
    name: String,
    description: String,
    coordinates: Array,
    innerBoundaries: Array,
    pageImpressions: String
});

var Area = mongoose.model('Area', dbSchema);

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

// find each area with a description matching 'Commune'
let query = Area.find();
// execute the query at a later time
query.exec(function (err, areas) {
  if (err) return new Error(err);
  for(var i=0;i<areas.length;i++){
    Area.update(
      {
          _id: areas[i]._id
      },
      {
          pageImpressions: randomIntFromInterval(1000, 100000).toString()
      },
      {
        multi: true
      },
      function (err, results) {

          if (err) {
              reject(err);
              return;
          }
          //console.log(areas[i]._id + " Entry updated: " + i);
      });
  }
});
