const express=require('express');
const { addCategory, getCategory, deleteCategory, editCategory, getCategoryById } = require('../controllers/category');
const { requireSignIn, adminMiddleware } = require('../common-middleware');
const router=express.Router();





router.post('/admin/addCategory', requireSignIn , adminMiddleware, addCategory);
router.get('/admin/getCategory', requireSignIn , adminMiddleware, getCategory);
router.get('/admin/getCategoryById/:categoryId', requireSignIn , adminMiddleware, getCategoryById );
router.delete('/admin/deleteCategory/:categoryId',  requireSignIn , adminMiddleware, deleteCategory);
router.put('/admin/editCategory/:categoryId',  requireSignIn , adminMiddleware, editCategory);

//user
router.get('/user/getCategory', getCategory);


module.exports=router;