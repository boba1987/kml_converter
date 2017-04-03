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

var data = '';
var readStream = fs.createReadStream('CHE_adm3.kml', 'utf8');

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
  var temp = [];

  for(var i=0;i<coordinates.length;i++){
    objToStore = {};
    objToStore.name = coordinates[i].match(/<name>(.*?)<\/name>/g).toString().replace(/<\/?name>/g,'');
    objToStore.pageImpressions = randomIntFromInterval(1000, 100000).toString();
    objToStore.description = coordinates[i].match(/<description>(.*?)<\/description>/g).toString().replace(/<\/?description>/g,'');

    substringLev1 = coordinates[i].match(/<MultiGeometry>(.*?)<\/MultiGeometry>/g).toString().replace(/<\/?MultiGeometry>/g,'');
    substringLev1 = substringLev1.replace(/<\/Polygon>/g, '').replace(/<Polygon>/g,'');
    substringLev1 = substringLev1.replace(/<outerBoundaryIs>/g, '').replace(/<LinearRing>/g, '').replace(/<coordinates>/g, '');
    substringLev1 = substringLev1.replace(/\t/g,'');
    substringLev1 = substringLev1.replace(/<\/coordinates>/g,'').replace(/<\/LinearRing>/g, '').replace(/<\/outerBoundaryIs>/g, '|');
    coordsArray = substringLev1.split("|");

    objToStore.coordinates = [];
    objToStore.innerBoundaries = [];
    var temp = [];
    for (var j=0;j<coordsArray.length;j++) {
      if (coordsArray[j].indexOf('innerBoundaryIs') != -1) {
        coordsArray[j] = coordsArray[j].replace(/<innerBoundaryIs>/g, '').replace(/<\/innerBoundaryIs>/g, '|').split("|");
        coordsArray[j].splice(coordsArray[j].length-1, 1);
        for(var k=0;k<coordsArray[j].length;k++) {
          objToStore.innerBoundaries.push( createPolyObject(coordsArray[j][k].split(" "))); // Push into innerBoundaries
          objToStore.coordinates[j-1].unshift( createPolyObject(coordsArray[j][k].split(" ")) ); // Push into previous 'coordinates' prop
        }
      } else {
        objToStore.coordinates[j] = createPolyObject(coordsArray[j].split(" "));
      }
    }

    // If there is empty array in 'objToStore' delete it
    objToStore.coordinates.forEach(function(coord, index){
      if(!coord.length) {
        objToStore.coordinates.splice(index, 1);
      }
    });

    objToMongo = new Area(objToStore);
    objToMongo.save(function(err, obj){
      if (err) return console.error(err);
    });
  }
});

function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function createPolyObject(arr) {
  var polyArray = [];

  for (var i=0; i<arr.length-1;i++) {
    if( arr[i][0] == "," ) {
      arr[i] = arr[i].replace(",", "");
    }
    if(!isNaN(parseFloat(arr[i].split(',')[1]))) {
      polyArray.push({
        lat: parseFloat(arr[i].split(',')[1]) - 0.0028,
        lng: parseFloat(arr[i].split(',')[0]) - 0.00095
      })
    } else {
      console.log("This produces NaN: ", arr[i].split(',')[1] );
    }
  };

  return polyArray;
}
