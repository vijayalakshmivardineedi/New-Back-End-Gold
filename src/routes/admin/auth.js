const express=require('express');
const {signup, signout, signin, forgotPassword, verifyCodeAndResetPassword,}=require("../../controllers/admin/auth");
const { validateSignUpRequest,validateSignInRequest, isRequestValidated } = require('../../validator/auth');
const { requireSignIn, adminMiddleware } = require('../../common-middleware');
const router=express.Router();



router.post('/admin/signin', validateSignInRequest,isRequestValidated , signin );
router.post('/admin/signup',validateSignUpRequest, isRequestValidated , signup);
router.post('/admin/signout', requireSignIn, adminMiddleware, signout);
router.post('/admin/forgotPassword', forgotPassword);
router.post('/admin/verifyCodeAndResetPassword', verifyCodeAndResetPassword);

module.exports=router;
