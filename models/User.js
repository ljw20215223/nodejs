 const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10
const jwt = require('jsonwebtoken');
 const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,//공백 없애주기
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
 })
 userSchema.pre('save', function(next){
    var user = this;
if(user.isModified('password')){
      //비번 암호화
   bcrypt.genSalt(saltRounds, function (err, salt){
    if(err) return next(err)
    bcrypt.hash(user.password,salt,function(err, hash){
    if(err) return next(err)
    user.password = hash
    next()
    })
    });
}else{
    next();
}
})

 userSchema.methods.comparePassword = function(plainPassword, cb){
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        return cb(null, isMatch);
    })
 }
 //docs.generateToken this=docs
 userSchema.methods.generateToken = function(cb){
   var user = this;
   var token =jwt.sign(user._id.toHexString(),'secret')
   user.token = token
   
   user.save().then(()=>{
     cb(null,user)
   }).catch((err)=>cb(err));
 }
 //statics에서 this는 mongoose모델을 의미
 userSchema.statics.findByToken = function(token, cb){
    var user = this;
    jwt.verify(token,'secret',function(err, decoded){
        user.findOne({"_id":decoded,"token":token})
        .then((user)=>{
            return cb(null, user);
        })
        .catch((err)=>{
           return cb(err);
        });
    });
 };
 const User = mongoose.model('User', userSchema)

 module.exports = { User }