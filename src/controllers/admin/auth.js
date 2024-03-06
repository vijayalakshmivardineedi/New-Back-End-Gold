const Admin = require('../../models/admin');
const bcrypt = require('bcrypt');
const shortid = require('shortid');
const { sendEmail } = require('../../validator/email');
const NodeCache = require('node-cache');
const saltRounds = 10;
const { generateJwtToken, generateVerificationCode } = require('../../common-middleware/code');
const emailVerificationCache = new NodeCache();




exports.signup = (req, res) => {
    Admin.findOne({ email: req.body.email })
        .exec(async (error, admin) => {
            if (admin) return res.status(400).json({
                message: "Admin already registered"
            });

            const { firstName, secondName, email, password, contactNumber } = req.body;
            const hash_password = await bcrypt.hash(password, 10);
            const fullname = `${firstName} ${secondName}`;
             const _admin = new Admin({
                firstName,
                secondName,
                email,
                hash_password,
                username: shortid.generate(),
                contactNumber,
                role: "admin",
                fullname,
            });

            _admin.save((error, data) => {
              if (error) {
                if (error.name === 'ValidationError') {
                    // Handle validation errors
                    const errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
                    return res.status(400).json({ message: errorMessage });
                } else {
                    // Handle other errors
                    console.error("Database error:", error);
                    return res.status(500).json({ message: "Something went wrong" });
                }
            }
                if (data) {
                    try {
                        //sendEmail(email, "Account Creation", `Hi ${firstName}\nWe are delighted to inform you that your admin account has been successfully created.`);
                        console.log("Email sent successfully");
                        return res.status(201).json({
                            message: "Admin created successfully"
                        });
                    } catch (emailError) {
                        console.error("Email sending error:", emailError);
                        return res.status(500).json({
                            message: "Failed to send email"
                        });
                    }
                }
            });
        });
};



exports.signin = (req, res) => {
  Admin.findOne({ email: req.body.email }).exec(async (error, admin) => {
    if (error) return res.status(400).json({ error });
    if (admin) {
      const isPassword = await admin.authenticate(req.body.password);
      if (isPassword) {
        // You may want to check for role here and handle admin-specific logic
        if (admin.role === "admin") {
          const token = generateJwtToken(admin._id, admin.role);
          const { _id, firstName, secondName, email, role, fullName } = admin;
          res.status(200).json({
            token,
            admin: { _id, firstName, secondName, email, role, fullName },
            message: "Successfully Signin",
          });
        } else {
          return res.status(400).json({
            message: "You do not have admin privileges",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid Password",
        });
      }
    } else {
      return res.status(400).json({
        message: "Something went wrong",
      });
    }
  });
};

exports.signout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    message: 'SignOut successfully...!'
  });
}


exports.forgotPassword = (req, res) => {
  const to = req.body.email;
  const subject = 'Forgot Password Verification Code';

  // Assuming you have a database connection or ORM (e.g., Mongoose, Sequelize) set up
  // You would query your database to check if the email exists
  // Here, we'll assume you have a Admin model for the database
  Admin.findOne({ email: to }, (err, admin) => {
    if (err) {
      // Handle the database error, e.g., log it and return an error response
      console.error("Database error:", err);
      res.status(500).send('Internal server error');
      return;
    }

    if (!admin) {
      // If the email doesn't exist in your database, you can return an error response
      res.status(404).send('Email not found in our database');
      return;
    }
    // If the email exists in your database, generate a verification code
    const verificationCode = generateVerificationCode();
    const text = `Your verification code is: ${verificationCode}`;

    // Log cache storage information
    console.log(`Storing verification code in cache for email: ${to}`);

    // Store the verification code in a cache with the admin's email
    emailVerificationCache.set(to, verificationCode, 600);

    // Log email sending information
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Email content: ${text}`);

    // Use the sendEmail function to send the verification email
    //sendEmail (to, subject, text);

    res.send('Verification code sent to your email');
  });
};



// Add a new route for code verification and password reset
exports.verifyCodeAndResetPassword = (req, res) => {
  const email = req.body.email;
  const code = req.body.code;
  const newPassword = req.body.newPassword;

  // Check if the provided code matches the one stored in the cache
  const storedCode = emailVerificationCache.get(email);


  if (!storedCode || storedCode !== code) {
    res.status(400).send('Invalid verification code');
    return;
  }

  // Code is valid, reset the admin's password
  Admin.findOne({ email: email }, (err, admin) => {
    if (err) {
      // Handle the database error
      console.error("Database error:", err);
      res.status(500).send('Internal server error');
      return;

    }
    if (!admin) {
      res.status(404).send('Email not found in our database');
      return;
    }

    // Manually hash and update the admin's password for password reset
    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

    // Update the admin's hashed password
    admin.hash_password = hashedPassword;

    // Save the updated admin in the database
    admin.save((err) => {
      if (err) {
        console.error("Password reset error:", err);
        res.status(500).send('Error resetting password');
      } else {
        // Password reset successful
        res.send('Password reset successfully');
      }
    });
  });
};