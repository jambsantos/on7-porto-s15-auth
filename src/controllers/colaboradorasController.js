const colaboradoras = require('../models/colaboradoras');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

const create = (req, res) => {
  const senhaComHash = bcrypt.hashSync(req.body.senha, 10);
  req.body.senha = senhaComHash;
  const colaboradora = new colaboradoras(req.body);

  colaboradora.save(function(err) {
    if (err) {
      res.status(424).send({ message: err.message })
    }

    res.status(201).send(colaboradora)
  })
};

const getAll = (req, res) => {
 const authHeader = req.get('authorization')
 if (!authHeader){
   return res.status(401).send('Header em branco');
 }
 const token = authHeader.split(' ')[1]

 jwt.verify(token,SECRET, err =>{
   if (err){
    return res.status(424).send({ message: err.message });
   }
   colaboradoras.find(function(err, colaboradoras){
    if(err) {
      res.status(500).send({ message: err.message })
    }
    res.status(200).send(colaboradoras)
  });
 });
};

const login = (req, res) => {
  colaboradoras.findOne({ email: req.body.email }, function(error, colaboradora) {
    if (!colaboradora) {
      return res.status(404).send(`Não existe colaboradora com o email ${req.body.email}`);
    }
    const senhaValida = bcrypt.compareSync(req.body.senha, colaboradora.senha);

    if (!senhaValida) {
      return res.status(403).send('senha inválida');
    }

    const token = jwt.sign({ email: req.body.email }, SECRET);

    return res.status(200).send(token);
  });
}

module.exports = {
  create,
  getAll,
  login
}
