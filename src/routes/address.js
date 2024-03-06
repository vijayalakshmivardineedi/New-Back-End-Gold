const express = require('express');
const {  userMiddleware, requireSignIn } = require('../common-middleware');
const { addAddress, getAddress } = require('../controllers/address');

const router = express.Router();



router.post('/user/address/create', requireSignIn, userMiddleware, addAddress);
router.get('/user/getaddress', requireSignIn, userMiddleware, getAddress);

module.exports = router;