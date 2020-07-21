require('./config/config.js');
// require('./routes/usuario.js');
// Deben ser descargado con --save
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(require('./routes/usuario'));

// definición de servicios API
app.get('/', function (req, res) {
  res.json('Welcome Home');
})

mongoose.connect(process.env.URLDB,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex:true},
  (err,res)=>{
    if(err) throw err;
    console.log(`BBDD online`);
  });

app.listen(process.env.PORT,()=>{
  console.log(`Escuchando puerto ${process.env.PORT}`);
});
