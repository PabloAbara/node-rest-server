
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
//
// Vencimiento del TOKEN
// 60 * 60 * 24 * 30
process.env.CADUCIDAD_TOKEN = '72h' ;
//
// SEED
//
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-development';
//
// GOOGLE CLIENT ID
//
process.env.CLIENT_ID = process.env.CLIENT_ID || '247713730676-7tojql2fq0dn6kkljp8um90sc85nt27q.apps.googleusercontent.com';
