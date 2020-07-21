
//
// puerto
//
process.env.PORT = process.env.PORT || 3000;
//
// ENTORNO
//
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'
//
// BBDDD
//
let urlDB;
if(process.env.NODE_ENV === 'dev'){
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB = process.env.Mongo_URL;
}
process.env.URLDB = urlDB;
