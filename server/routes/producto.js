const express = require('express');
const auth = require('../middlewares/authentication');
const app = express();
const Producto = require('../models/producto');
const _ = require('underscore');


// Buscar productos
app.get('/producto/buscar/:termino',auth.token_verification,(req,res)=>{
  let termino = req.params.termino;
  // expresion regular
  let regex = new RegExp(termino,'i');

  Producto.find({nombre:regex, disponible:true})
    .populate('categoria','nombre')
    .exec((err,productos)=>{
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      } else {
        res.json({
          ok: true,
          productos: productos
        });
      }
    });
});

// Crear un nuevo producto
app.post('/producto', [auth.token_verification, auth.admin_verification], (req, res) => {
  let body = req.body;
  let producto = new Producto({
    nombre: body.nombre,
    precioUni:body.precioUni,
    descripcion:body.descripcion,
    disponible:true,
    categoria:body.categoria,
    usuario: req.usuario
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    } else if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    } else {
      res.json({
        ok: true,
        producto: productoDB
      });
    }
  });
});

// Actualizar producto
app.put('/producto/:id', [auth.token_verification, auth.admin_verification], (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body,['nombre', 'precioUni']);

  Producto.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
      context: 'query',
      useFindAndModify: false
    },
    (err, productoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      } else if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err:{
            msj:'No se ha encontrado el producto'
          }
        });
      } else {
        res.json({
          ok: true,
          msj:'Producto actualizado',
          producto: productoDB
        });
      }
    });
});

// Soft-Delete producto
app.delete('/producto/:id', [auth.token_verification,auth.admin_verification] ,(req, res)=> {
  let id = req.params.id;
  let body = {disponible:false};

  // Usuario.findByIdAndRemove(id,(err,usuarioEliminado) => {
  Producto.findByIdAndUpdate(id,body,{
    new:true,
    runValidators:true,
    context: 'query',
    useFindAndModify:false}
    ,(err,prodDeletedDB) => {
      if(err){
        return res.status(500).json({
          ok:false,
          err
        });
      } else if(!prodDeletedDB){
        return res.status(400).json({
          ok:false,
          err:{
            msj:"No se ha encontrado el producto"
          }
        });
      } else {
        res.json({
          ok:true,
          msj: "Producto eliminado de la BBDD",
          producto:prodDeletedDB
        });
      }
  });
});

// obtener todas las categorías
app.get('/producto', auth.token_verification, (req, res) => {
  let desde = req.query.desde || 1;
  desde = Number(desde)-1;

  let limite = req.query.limite || 10;
  limite = Number(limite);
  Producto.find({disponible:true})
    .skip(desde)
    .limit(limite)
    .sort('nombre')
    .populate('usuario','nombre email')
    .populate('categoria','nombre')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      Producto.countDocuments({disponible:true}, (err, conteo) => {
        res.json({
          ok: true,
          count: conteo,
          productos
        });
      });
    });
});

// get: mostrar una categoría por id
app.get('/producto/:id', auth.token_verification, (req, res) => {
  let id = req.params.id;

  Producto.findById(id)
  .populate('usuario','nombre email')
  .populate('categoria','nombre')
  .exec(  (err, productoDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err
          });
        } else if(!productoDB){
          return res.status(400).json({
            ok: false,
            err:{
              msj:'El producto no se encontró en la BBDD'
            }
          });
        } else {
          res.json({
            ok: true,
            categoria: productoDB
          });
        }
      });

});

module.exports = app;
