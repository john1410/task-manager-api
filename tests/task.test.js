//test for Tasks
const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/db/models/task');
const {userOneId,userOne,setupDatabase,taskOne,taskTwo,userTwoId, userTwo,} = require('./fixtures/db');
beforeEach(setupDatabase);

test('Should create task for user',async ()=>{
  const res = await request(app).post('/tasks')
      .set({'Authorization':`Bearer ${userOne.tokens[0].token}`})
      .send({description:'from test'})
      .expect(201);
  const task = await Task.findById(res.body._id);
  expect(task).not.toBeNull();
  expect(task.complete).toEqual(false);
});
//get the all task for user
test('Should get all tasks for user',async ()=>{
  const res = await request(app).get('/tasks')
      .set({'Authorization':`Bearer ${userOne.tokens[0].token}`})
      .send()
      .expect(200);
  expect(res.body.length).toEqual(2);
});
//delete the task from user
test('Should delete the task for user',async ()=>{
  const res = await request(app).delete(`/tasks/${taskOne._id}`)
      .set({'Authorization':`Bearer ${userTwo.tokens[0].token}`})
      .send()
      .expect(404)

});