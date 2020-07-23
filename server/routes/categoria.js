const express = require('express');
const auth = require('../middlewares/authentication');
const app = express();
const Categoria = require('../models/categoria');
const _ = require('underscore');

// get: /categoria
// obtener todas las categorías
app.get('/categoria', auth.token_verification, (req, res) => {
  Categoria.find({})
    .sort('nombre')
    .populate('usuario','nombre email')
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      Categoria.countDocuments({}, (err, conteo) => {
        res.json({
          ok: true,
          count: conteo,
          categorias
        });
      });
    });
});

// get: mostrar una categoría por id
app.get('/categoria/:id', auth.token_verification, (req, res) => {
  let id = req.params.id;

  Categoria.findById(id, (err, categoriaDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      } else if(!categoriaDB){
        return res.status(400).json({
          ok: false,
          err:{
            msj:'La categoria no se encontró en la BBDD'
          }
        });
      } else {
        res.json({
          ok: true,
          categoria: categoriaDB
        });
      }
    });
});

// Crear una nueva categoría
app.post('/categoria', [auth.token_verification, auth.admin_verification], (req, res) => {
  let body = req.body;
  // console.log(req.usuario);
  // console.log(body.nombre);
  let categoria = new Categoria({
    nombre: body.nombre,
    usuario: req.usuario
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    } else if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    } else {
      res.json({
        ok: true,
        categoria: categoriaDB
      });
    }
  });
});

// Put: actualizar categoría (al menos el nombre)
app.put('/categoria/:id', [auth.token_verification, auth.admin_verification], (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body,['nombre']);

  Categoria.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
      context: 'query',
      useFindAndModify: false
    },
    (err, categoriaDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      } else if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err:{
            msj:'No se ha encontrado la categoria'
          }
        });
      } else {
        res.json({
          ok: true,
          msj:'Categoria actualizada',
          categoria: categoriaDB
        });
      }
    });
});

// Delete de categoría. Que solo la pueda borrar el admin (hard delete)
app.delete('/categoria/:id', [auth.token_verification, auth.admin_verification], (req, res) => {
  // res.json('deleteUsuario');
  let id = req.params.id;

  Categoria.findByIdAndRemove(id,{
      new: true,
      runValidators: true,
      context: 'query',
      useFindAndModify:false
    },(err,catRemovedDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      if (!catRemovedDB) {
        return res.status(400).json({
          ok: false,
          err:'La categoria no existe en la BBDDNo existe la categoria para ser eliminada'
        });
      } else {
        res.json({
          ok: true,
          msj: "Categoria eliminada de la BBDD",
          categoria: catRemovedDB
        });
      }
    });
});

module.exports = app;
