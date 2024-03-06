const jwt=require('jsonwebtoken')


// exports.requireSignIn=(req,res,next)=>{
//     if(req.headers.authorization){
//         const token = req.headers.authorization.split(" ")[1];
//         //console.log(process.env.JWT_SECRET);
//     const user = jwt.verify(token,process.env.JWT_SECRET);
//         req.user = user;
//     }
//     else{
//         return res.status(400).json({message:"Authorization required"})
        
//     }
//     next();
    
// }





// exports.userMiddleware=(req,res,next)=>{
//    // console.log(req.user.role)
//     if(req.user.role!=="user"){
//         return res.status(400).json({message:" User Access denied"})
//     }
//     next();
// }

// exports.adminMiddleware=(req,res,next)=>{
//     if(req.user.role!=="admin"){
//         return res.status(400).json({message:" Admin Access denied"})
//     }
//     next();
// }


exports.requireSignIn = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            req.user = user;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    } else {
        return res.status(400).json({ message: "Authorization header required" });
    }
};

exports.userMiddleware = (req, res, next) => {
    if (req.user.role !== "user") {
        return res.status(403).json({ message: "User access denied" });
    }
    next();
};

exports.adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access denied" });
    }
    next();
};
