const express=require('express');
const {signup, signin, signout, forgotPassword, verifyCodeAndResetPassword, updateProfile, deleteProfileImage, getUserByEmail}=require("../controllers/auth");
const { validateSignUpRequest, isRequestValidated, validateSignInRequest} = require('../validator/auth');
const router=express.Router();
const { requireSignIn, userMiddleware } = require('../common-middleware');


router.post('/user/signup', validateSignUpRequest , isRequestValidated, signup);
router.post('/user/signin', validateSignInRequest, isRequestValidated ,signin);
router.post('/user/signout', signout);
router.post('/user/forgotPassword', forgotPassword);
router.post('/user/verifyCodeAndResetPassword', verifyCodeAndResetPassword);
router.put('/user/updateProfile', requireSignIn, userMiddleware, updateProfile);
router.post('/user/deleteProfileImage', requireSignIn, userMiddleware, deleteProfileImage);
router.get('/user/getUserByEmail/:email', requireSignIn, userMiddleware, getUserByEmail);


module.exports=router;
