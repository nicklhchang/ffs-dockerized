const mongoose = require('mongoose');
const crypto = require('crypto');

const pbkdf2Config = [10000,64,'sha512'];

const MemberSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,'Please provide a username'],
        minlength:3,
        maxlength:20,
        unique:true
    },
    email:{
        type:String,
        // required:[true,'Please provide an email'], // turn off for testing
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'Please provide a valid email'],
        unique:true
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength:8
    },
    salt:{
        type:String
    }
});

// must be logged in as a member to add to cart
MemberSchema.pre('save', function(next) {
    this.salt = crypto.randomBytes(32).toString('hex');
    this.password = crypto.pbkdf2Sync(this.password,this.salt,...pbkdf2Config).toString('hex');
    next();
});

MemberSchema.methods.validatePassword = function(password) {
    let pwdToBeVerified = crypto.pbkdf2Sync(password,this.salt,...pbkdf2Config).toString('hex');
    return this.password === pwdToBeVerified;
}
// attach model to default mongoose connection
module.exports = mongoose.model('Member', MemberSchema);