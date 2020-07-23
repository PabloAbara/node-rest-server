const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();
const Usuario = require('../models/usuario');
const auth = require('../middlewares/authentication');


app.get('/usuario', auth.token_verification ,(req, res) => {
  // res.json('getUsuario');

  // return res.json({
  //   usuario:req.usuario,
  //   nombre:req.usuario.nombre,
  //   email:req.usuario.email
  // });

  let desde = req.query.desde || 0;
  desde = Number(desde)-1;

  let limite = req.query.limite || 5;
  limite = Number(limite);

  Usuario.find({estado:true},'nombre email role estado google img')
    .skip(desde)
    .limit(limite)
    .exec((err,usuarios)=>{
      if(err){
        return res.status(400).json({
          ok:false,
          err
        });
      }

      Usuario.countDocuments({estado:true},(err,conteo)=>{
        res.json({
          ok:true,
          count:conteo,
          usuarios
        });
      });

    });
});

app.post('/usuario', [auth.token_verification,auth.admin_verification] , (req, res)=> {
  let body = req.body;

  let usuario = new Usuario({
    nombre:body.nombre,
    email:body.email,
    password:bcrypt.hashSync(body.password,10),
    role:body.role
  });

  usuario.save((err,usuarioDB)=>{
    if(err){
      return res.status(400).json({
        ok:false,
        err
      });
    }
    // usuarioDB.password = null;

    res.json({
      ok:true,
      usuario:usuarioDB
    });
  });
});

app.put('/usuario/:id', [auth.token_verification,auth.admin_verification] ,(req, res)=> {
  let id = req.params.id;
  let body = _.pick(req.body,['nombre', 'email', 'role', 'img']);

  Usuario.findByIdAndUpdate(id,body,
    {new:true,runValidators:true,context: 'query',useFindAndModify:false},
    (err,usuarioDB) => {
    if(err){
      return res.status(400).json({
        ok:false,
        err
      });
    }
    // usuarioDB.save;

    res.json({
      ok:true,
      usuario:usuarioDB
    });
  });


})

app.delete('/usuario/:id', [auth.token_verification,auth.admin_verification] ,(req, res)=> {
  // res.json('deleteUsuario');
  let id = req.params.id;
  let body = {estado:false};

  // Usuario.findByIdAndRemove(id,(err,usuarioEliminado) => {
  Usuario.findByIdAndUpdate(id,body,
    {new:true,runValidators:true,context: 'query',useFindAndModify:false},
    (err,usuarioDB) => {
    if(err){
      return res.status(400).json({
        ok:false,
        err
      });
    }
    // usuarioDB.save;
    res.json({
      ok:true,
      msj: "El usuario ha sido eliminado de la BBDD",
      usuario:usuarioDB
    });
  });




});

module.exports = app;
