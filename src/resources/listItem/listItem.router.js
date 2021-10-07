const express = require('express');
const router = express.Router();


const { protect } = require('../../utils/auth');
const { createOne, check, uncheck, deleteItem } = require('./listItem.controller');



router.route('/')
  .post([protect], createOne)
  .delete([protect], deleteItem)
router.route('/check')
  .post(check)
router.route('/uncheck')
  .post([protect], uncheck)

 
module.exports = router;
