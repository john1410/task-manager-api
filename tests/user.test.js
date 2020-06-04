//test file for user
// => use it super test
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoos = require('mongoose');
const app = require('../src/app');
//import user modal to access it
const User = require('../src/db/models/user');
const {userOneId,userOne,setupDatabase} = require('./fixtures/db');
beforeEach(setupDatabase);

//test for signup
test('Should signup user',async ()=>{
   const res= await request(app).post('/users').send({
       name:'johny',
        email:'johny@test.com',
        password:'teststest'
    }).expect(201);
   //find in db for user with this id

    //Assert that db was changed correctly
    const user = User.findById(res.body.user._id);
    expect(user).not.toBeNull();
    //Assertion about res
    expect(res.body.user.name).toBe('johny');
    //match object
    expect(res.body).toMatchObject({
        user:{
            name:'johny',
            email:'johny@test.com',
        },
        // token:user.tokens[0].token
    })
});

//test login exit user
//=>reza exist user
test('Should login with exist user',async ()=>{
   const res = await request(app).post('/users/login').send({
       email:userOne.email,
       password:userOne.password
   }).expect(200);
   //find user
    const user = await User.findById(userOneId);
    // console.log(user.tokens[1].token)
    // console.log(res.body.token)
    expect(res.body.token).toBe(user.tokens[1].token);
});

//test for user can not login
test("Shouldn't login user",async ()=>{
   request(app).post('/users/login').send({
       email:'tt',
       password:";kfd;"
   }) .expect(400);
});
//auth user
//get profile user
test('Should get profile',async ()=>{
   await request(app).get('/users/me')
       .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
       .send()
       .expect(200);
});
//didnt get user profile
test("Shouldn't get profile",async ()=>{
    await request(app).get('/users/me')
        .send()
        .expect(401);
});

//delete user
test('Should delete user',async ()=>{
   await request(app).delete('/users/me')
       .set({'Authorization':`Bearer ${userOne.tokens[0].token}`})
       .send()
       .expect(200);
    //check after remove it is null
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});
//cant delete user
test("Shouldn't delete user",async ()=>{
    await request(app).delete('/users/me')
        .send()
        .expect(401)
});
//upload image avatar test
test('Should upload avatar image',async ()=>{
    await request(app).post('/users/me/avatar')
        .set({'Authorization':`Bearer ${userOne.tokens[0].token}`})
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId);
    //=> use any to choose any data type we want
    expect(user.avatar).toEqual(expect.any(Buffer));
});
//update user test
test('Should update user info',async ()=>{
   await request(app).patch('/users/me')
       .set({'Authorization':`Bearer ${userOne.tokens[0].token}`})
       .send({name:'reza'})
       .expect(200);
   const user = await User.findById(userOneId);
    expect(user.name).toBe('reza');
});
test("Shouldn't update user info",async ()=>{
    await request(app).patch('/users/me')
        .set({'Authorization':`Bearer ${userOne.tokens[0].token}`})
        .send({location:'30.8'})
        .expect(400);
});