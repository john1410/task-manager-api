console.clear();
const express = require('express');
//**for run the db
require('./db/mongoose');
//**
const  User = require('./db/models/user');
const Task = require('./db/models/task');
//import router
const  userRout =require('./routers/users');
const  taskRout =require('./routers/tasks');
const app=express();
//middleware
app.use(express.json());
app.use(userRout);
app.use(taskRout);

const port = process.env.PORT;
//test
app.get('/test',(req,res)=>{
   res.send('hi its working');
});

//app begin listen
app.listen(port,()=>{
    console.log('Server is up on '+port);
});

