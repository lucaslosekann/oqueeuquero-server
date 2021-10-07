const express = require('express');
const router = express.Router();


const { protect } = require('../../utils/auth');
const { createSession } = require('./payments.controller');



router.post('/createSession', [protect], createSession);
 
module.exports = router;
