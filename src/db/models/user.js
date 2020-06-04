const {isEmail} = require('validator');
const mongoose = require('mongoose');
const bcrypt =require('bcryptjs');
const jwt = require('jsonwebtoken');
//import task model
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type: String,
        required: true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!isEmail(value)){
                throw  new Error('Email is not valid!');
            }
        }
    },
    password:{
        type:String,
        required:true,
        minLength:7,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw  new Error('Password connot have "password"');
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value < 0){
                throw  new Error('age cannot be negative');
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true,
        }
    }],
    avatar:{
        type:Buffer,
    }
},{
    timestamps:true,
});

//virtual property
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner',
});


//for login user pas and email
userSchema.statics.findByCredentials=async ({email,password}) =>{
    const user = await  User.findOne({email});
    if(!user){
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('Unable to login');
    }

    return user;
};
//generate auth token
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    // const token = jwt.sign({_id:user.id.toString()},'thismynewcourse');
    const token = jwt.sign({_id:user.id.toString()},process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();

    return token;
};
//user
userSchema.methods.toJSON=function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject
};


//hash the password before saving
userSchema.pre('save',async function (next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
});

//delete tasks when user removed
userSchema.pre('remove',async function (next) {
    const user =this;
    await Task.deleteMany({owner:user._id});

    next();
});
//create User model
const User = mongoose.model('User',userSchema);

module.exports = User;