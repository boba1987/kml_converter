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
    coordinates: Array
});

var Area = mongoose.model('Area', dbSchema);

// var data = '';
// var readStream = fs.createReadStream('CHE_adm3.kml', 'utf8');
//
// readStream.on('data', function(chunk) {
//     data += chunk;
// }).on('end', function() {
//   var trimmedData = data.replace(/\r?\n|\r/g, "");
//   var coordinates = trimmedData.match(/<Placemark>(.*?)<\/Placemark>/g);
//
//   var coordsArray;
//   var objToStore;
//   var objToMongo;
//
//   for(var i=0;i<coordinates.length;i++){
//     objToStore = {};
//     objToStore.name = coordinates[i].match(/<name>(.*?)<\/name>/g).toString().replace(/<\/?name>/g,'');
//     objToStore.description = coordinates[i].match(/<description>(.*?)<\/description>/g).toString().replace(/<\/?description>/g,'');
//
//     coordsArray = coordinates[i].match(/<coordinates>(.*?)<\/coordinates>/g).toString().split(" ");
//     coordsArray[0] = coordsArray[0].replace(/<\/?coordinates>/g,''); // Remove <coordinates> from first member of the array
//     coordsArray[coordsArray.length-1] = coordsArray[coordsArray.length-1].replace(/<\/?coordinates>/g,''); // Remove </coordinates> from last member of the array
//
//     objToStore.coordinates = createPolyObject(coordsArray);
//     console.log(objToStore);
//
//     objToMongo = new Area(objToStore);
//     objToMongo.save(function(err, obj){
//       if (err) return console.error(err);
//     });
//   }
// });
//
// function createPolyObject(arr) {
//   var polyArray = [];
//
//   for (var i=0; i<arr.length;i++) {
//     polyArray.push({
//       lat: arr[i].split(',')[1],
//       lng: arr[i].split(',')[0]
//     })
//   };
//
//   return polyArray;
// }

// find each area with a description matching 'Commune'
var query = Area.find({ 'description': 'Canton|Kanton|Chantun' });

// selecting the `name`
query.select('name');

// execute the query at a later time
query.exec(function (err, area) {
  if (err) return handleError(err);
  console.log('*****************************', area) // Space Ghost is a talk show host.
});
