const mongoose = require('mongoose');
//task schema
const taskSchema = mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true,
    },
    complete:{
        type: Boolean,
        default:false,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectID,
        required: true,
        ref:'User'

    }
},{
    timestamps:true,
});
const Task = mongoose.model('Task',taskSchema);

module.exports = Task;