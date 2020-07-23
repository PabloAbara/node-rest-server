const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const app = express();
const Usuario = require('../models/usuario');

app.post('/login', function (req, res) {

  let body = req.body;

  Usuario.findOne({email: body.email},(err,usuarioDB)=>{
    if(err){
      return res.status(500).json({
        ok:false,
        err
      });
    }
    if(!usuarioDB){
      return res.status(400).json({
        ok:false,
        err:{
          msj:'Usuario (o contraseña) incorrectos'
        }
      });
    }
    if(!bcrypt.compareSync(body.password,usuarioDB.password)){
      return res.status(400).json({
        ok:false,
        err:{
          msj:'Contraseña (o usuario) incorrectos'
        }
      });
    }

    let token = jwt.sign({
      usuario: usuarioDB
    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN});

    res.json({
      ok:true,
      usuario:usuarioDB,
      token
    });

  });

});

// Configuración de GOOGLE
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  return {
    name:payload.name,
    email:payload.email,
    img:payload.picture,
    google:true,
  }
}
// verify().catch(console.error);

app.post('/google',async (req, res) => {
  let id_token = req.body.id_token;
  let googleUser = await verify(id_token)
    .catch(err=>{
      // atrapa si hay un error de validación del token
      res.status(403).json({
        ok:false,
        err
      });
    });
  // sigue si la validación de Google es correcta y tengo un Google User válido
  Usuario.findOne({email:googleUser.email},(err,usuarioDB)=>{
    if(err){
      // si hay un error del server, mostrarlo
      res.status(500).json({
        ok:false,
        err
      });
    }
    if(usuarioDB){
      // el usuario ya existe
      if(usuarioDB.google === false){
        // existe pero no es usuario de google
        res.status(400).json({
          ok:false,
          err:{
            msj:"Debe de usar su auth normal, ya ha sido autenticado"
          }
        });
      } else {
        // existe y es un usuario de google
        let token = jwt.sign({
          usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN});
        return res.json({
          ok:true,
          usuario:usuarioDB,
          token
        });
      }
    } else {
      // nuevo usuario en nuestra BBDD con credenciales válidas
      let usuario = new Usuario();
      usuario.nombre=googleUser.name;
      usuario.email=googleUser.email;
      usuario.img=googleUser.img;
      usuario.google = true;
      usuario.password = ":)";
      usuario.save((err,usuarioDB)=>{
        if(err){
          // si hay un error del server, mostrarlo
          res.status(500).json({
            ok:false,
            err
          });
        }
        let token = jwt.sign({
          usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN});
        return res.json({
          ok:true,
          usuario:usuarioDB,
          token
        });
      });
    }
  });
});

module.exports = app;
