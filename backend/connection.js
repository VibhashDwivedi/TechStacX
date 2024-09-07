require('dotenv').config();
const mongoose = require('mongoose');
const url = process.env.MONGODB_URI ;

//asynchronous function - returns a promise
mongoose.connect(url)
.then((result)=>{
    console.log('Connected to mongodb');
}).catch((err)=>{
     console.log(err);
});


module.exports = mongoose;