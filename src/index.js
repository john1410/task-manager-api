const app = require('./app');
//define port
const port = process.env.PORT;
//app begin listen
app.listen(port,()=>{
    console.log('Server is up on '+port);
});
