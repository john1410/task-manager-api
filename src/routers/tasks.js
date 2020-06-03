const express = require('express');
const router = express.Router();
const Task = require('../db/models/task');
//import middleware
const auth = require('../middleware/auth');

//TASK
//create user
router.post('/tasks',auth,async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner:req.user._id
        });
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e)
    }
});
//get tasks

//GET ?complete=
//GET ?limits=10&skip=
//GET ?sortBy= 1-field 2-asd or des
// => createdAt:asc  createdAt:desc
router.get('/tasks',auth,async (req, res) => {
    const match ={};
    const sort ={};

    if(req.query.complete){
        match.complete = req.query.complete === 'true';

    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        console.log(parts);
        sort[parts[0]] = parts[1] === 'dec' ? -1 : 1;
    }
    try {
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send()
    }
});
//get task by id
router.get('/tasks/:id',auth,async (req, res) => {
    const _id=req.params.id;
    try {
        const task =await Task.findOne({_id,owner: req.user._id});
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
});
//update task by id
router.patch('/tasks/:id',auth,async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'complete'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const _id = req.params.id;
        const task = await Task.findOne({_id,owner:req.user._id});

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);

    } catch (e) {
        res.status(400).send(e)
    }
});

//delete task by id
router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const _id= req.params.id;
        const task = await Task.findOneAndDelete({_id,owner:req.user._id});
        if(!task){
            return res.status(404).send(null);
        }
        res.status(200).send(task);
    }catch (e) {
        return res.status(500).send(e);
    }
});

module.exports = router;