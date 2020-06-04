const express = require('express');
const router =new express.Router();
const sharp =require('sharp');
const User = require('../db/models/user');
//import middleware
const auth = require('../middleware/auth');
//import multer middleware for upload
const multer = require('multer');

//USER
//create user
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
});
//get users for own profile
router.get('/users/me',auth ,async (req, res) => {
    res.send(req.user).status(200);
});

//update user me
router.patch('/users/me',auth,async (req,res)=>{
    //allowed item to update
    const allowedItems = ['name','email','password','age'];
    const updates = Object.keys(req.body);
    const isValidOperation =updates.every((update)=>{
        return allowedItems.includes(update);
    });

    if(!isValidOperation){
        return res.status(400).send({'error':'Invalid Update'});
    }
    try {
        updates.forEach((update)=>{
            req.user[update] = req.body[update];
        });
        await req.user.save();

        res.status(200).send(req.user);
    }catch (e) {
        res.send(e).status(400);
    }
});
//delete user by id
router.delete('/users/me',auth,async (req,res)=>{
    try {
        await req.user.remove();
        res.status(200).send(req.user);
    }catch (e) {
        return res.status(500).send(e);
    }
});

//login user
router.post('/users/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findByCredentials({email,password});
        const token = await user.generateAuthToken();
         res.send({user,token}).status(200);
    } catch (e) {
        return res.status(400).send(e);
    }
});
//logout user on current device
router.post('/users/logout',auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send('logout');
    } catch (e) {
        return res.status(500).send(e);
    }
});
//logout all devices
router.post('/users/logoutAll',auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    }catch (e) {
        res.status(500).send(e);
    }
});
//upload image profile user
const upload = multer({
    // dest:'avatar',
    // => when didnt save dest we cant access file in function
    limits:{
        fileSize:1000000,
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            cb(new Error('Pleas upload an image'));
        }
        cb(undefined,true);
    }
});
//upload avatar image
router.post('/users/me/avatar',auth,upload.single('avatar'), async (req, res) => {
    // req.user.avatar = req.file.buffer;
    req.user.avatar = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    await req.user.save();
    res.send();
},(error,req,res,next)=>{
    res.status(400).send({'error':error});
});
//delete avatar image
router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});
//get url for avatar user
router.get('/users/:id/avatar',async (req,res)=>{

    try {
        const {id} = req.params;
        const user = await User.findById(id);

        if(!user||!user.avatar){
            throw new Error();
        }

        res.set('Content-Type','image/jpg');
        res.send(user.avatar);
    }catch (e) {
        res.send(e).status(404);
    }
});

module.exports = router;