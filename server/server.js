require('./config/config.js');
// Debe ser descargado con --save
const express = require('express');
// Debe ser descargado con --save
const bodyParser = require('body-parser');
const app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// definición de servicios API
app.get('/', function (req, res) {
  res.json('Welcome Home');
})

app.get('/usuario', function (req, res) {
  res.json('getUsuario');
})

app.post('/usuario', function (req, res) {
  let body = req.body;
  if(body.nombre === undefined){
    res.status(400).json({
      ok:false,
      mensaje:`La request no contiene un nombre válido`
    })
  } else {
    res.json({
      persona:body
    });
  }
})

app.put('/usuario/:id', function (req, res) {
  let id = req.params.id;
  // res.json(`putUsuario de id ${id}`);
  res.json({
    id
  })
})

app.delete('/usuario', function (req, res) {
  res.json('deleteUsuario');
})


app.listen(process.env.PORT,()=>{
  console.log(`Escuchando puerto ${process.env.PORT}`);
});
