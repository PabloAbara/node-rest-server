const jwt = require('jsonwebtoken');
//
// verificación del Token
//
let token_verification = (req,res,next)=>{
  let token = req.get('Authorization'); //nombre del header
  // res.json({
  //   token
  // });
  jwt.verify(token,process.env.SEED,(err,decoded)=>{
    if(err){
      return res.status(401).json({
        ok:false,
        err:{
          msj:'token inválido'
        }
      });
    }
    // decoded es el payload.
    req.usuario = decoded.usuario;
    next();
  });

};

let admin_verification = (req,res,next)=>{
  let usuario = req.usuario;
  if(usuario.role==='ADMIN_ROLE'){
    next();
  } else {
    return res.status(401).json({
      ok:false,
      err:{
        msj:'No tienes permisos para ejecutar la acción'
      }
    });
  }

};

module.exports = {
  token_verification,
  admin_verification
}
