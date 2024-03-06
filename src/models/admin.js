// models/admin.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const adminSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    secondName: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    hash_password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true
    },
    contactNumber: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    }
}, { timestamps: true });


adminSchema.methods = {
    authenticate: async function (password) {
      return await bcrypt.compare(password, this.hash_password);
    },
}

module.exports = mongoose.model('Admin', adminSchema);
