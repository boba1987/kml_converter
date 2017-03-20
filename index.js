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
    innerBoundaries: Array
});

var Area = mongoose.model('Area', dbSchema);

var data = '';
var readStream = fs.createReadStream('CHE_adm1.kml', 'utf8');

readStream.on('data', function(chunk) {
    data += chunk;
}).on('end', function() {
  var trimmedData = data.replace(/\r?\n|\r/g, "");
  var coordinates = trimmedData.match(/<Placemark>(.*?)<\/Placemark>/g);

  var coordsArray;
  var objToStore;
  var objToMongo;
  var substringLev1;
  var substringLev1_5;
  var substringLev2;
  var substringLev2_25
  var substringLev2_5;
  var substringLev3;
  var substringLev4;
  var innerCoords;
  var innerCoordsLev2;

  for(var i=0;i<coordinates.length;i++){
    objToStore = {};
    objToStore.name = coordinates[i].match(/<name>(.*?)<\/name>/g).toString().replace(/<\/?name>/g,'');
    objToStore.description = coordinates[i].match(/<description>(.*?)<\/description>/g).toString().replace(/<\/?description>/g,'');

    substringLev1 = coordinates[i].match(/<MultiGeometry>(.*?)<\/MultiGeometry>/g).toString().replace(/<\/?MultiGeometry>/g,'');
    substringLev1_5 = substringLev1.replace(/<\/Polygon>/g, '').replace(/<Polygon>/g,'')
    substringLev2 = substringLev1_5.replace(/<outerBoundaryIs>/g, '').replace(/<LinearRing>/g, '').replace(/<coordinates>/g, '');
    substringLev2_5 = substringLev2.replace(/\t/g,'');
    substringLev3 = substringLev2_5.replace(/<\/coordinates>/g,'').replace(/<\/LinearRing>/g, '').replace(/<\/outerBoundaryIs>/g, '|');
    coordsArray = substringLev3.split("|");
    coordsArray.splice(coordsArray.length-1, 1);
    // if (substringLev2_5.indexOf('innerBoundaryIs') != -1) {
    //   innerCoords = substringLev2_5
    //                   .match(/<innerBoundaryIs>(.*?)<\/innerBoundaryIs>/g)
    //                   .toString()
    //                   .replace(/<\/coordinates><\/LinearRing>/g, '')
    //                   .replace(/<innerBoundaryIs>/g, '')
    //                   .replace(/<\/innerBoundaryIs>/g, '|')
    //                   .split('|');
    //
    //   innerCoords.splice(innerCoords.length-1, 1);
    //   objToStore.innerBoundaries = [];
    //   for (var k=0;k<innerCoords.length;k++) {
    //     objToStore.innerBoundaries[k] = createPolyObject(innerCoords[k].split(" "));
    //   }
    // }

    objToStore.coordinates = [];
    for (var j=0;j<coordsArray.length;j++) {
      objToStore.coordinates[j] = createPolyObject(coordsArray[j].split(" "));
    }

    objToMongo = new Area(objToStore);
    objToMongo.save(function(err, obj){
      if (err) return console.error(err);
    });
  }
});

function createPolyObject(arr) {
  var polyArray = [];

  for (var i=0; i<arr.length-1;i++) {
    if( arr[i][0] == "," ) {
      arr[i] = arr[i].replace(",", "");
    }
    polyArray.push({
      lat: parseFloat(arr[i].split(',')[1]),
      lng: parseFloat(arr[i].split(',')[0])
    })
  };

  return polyArray;
}

// // find each area with a description matching 'Commune'
// var query = Area.find({ 'description': 'Canton|Kanton|Chantun' });
//
// // selecting the `name`
// query.select('name');
//
// // execute the query at a later time
// query.exec(function (err, area) {
//   if (err) return handleError(err);
//   console.log('*****************************', area) // Space Ghost is a talk show host.
// });
