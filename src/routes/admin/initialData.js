const express=require('express');
const { initialData } = require('../../controllers/admin/initialData');
const router=express.Router();


router.post('/initialData', initialData );


/*router.post('/profile',requireSignIn,(req,res)=>{
    res.status(200).json({user:"Profile"})
})*/




module.exports=router;