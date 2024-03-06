const express=require('express');
const { addItemToWishlist, getWishlistItems, removeWishlistItems } = require('../controllers/wishlist');
const { requireSignIn, userMiddleware } = require('../common-middleware');
const router=express.Router();

router.post('/user/addItemToWishlist', requireSignIn , userMiddleware , addItemToWishlist)
router.get('/user/getWishlistItems', requireSignIn , userMiddleware , getWishlistItems);
router.post('/user/removeWishlistItems', requireSignIn , userMiddleware , removeWishlistItems)

module.exports = router;