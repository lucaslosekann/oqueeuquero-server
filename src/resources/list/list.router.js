const express = require('express');
const router = express.Router();


const { protect } = require('../../utils/auth');
const { createOne, getOne, getMany, deleteList } = require('./list.controller');



router.route('/')
  .post([protect], createOne)
  .get([protect], getMany)
  .delete([protect], deleteList)

router.route('/:ref')  
  .get(getOne)
 
module.exports = router;
