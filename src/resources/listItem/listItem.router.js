const express = require('express');
const router = express.Router();


const { protect } = require('../../utils/auth');
const { createOne, check, uncheck, deleteItem, getOne } = require('./listItem.controller');



router.route('/')
  .post([protect], createOne)
  .delete([protect], deleteItem)
router.route('/:id')  
  .get([protect],getOne)
router.route('/check')
  .post(check)
router.route('/uncheck')
  .post([protect], uncheck)

 
module.exports = router;
