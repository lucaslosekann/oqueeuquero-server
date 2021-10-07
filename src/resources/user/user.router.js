const express = require('express');
const { protect } = require('../../utils/auth');
const { me } = require('./user.controller');
const router = express.Router();


router.get('/',[protect], me)
// router.put('/', updateMe)


module.exports = router;