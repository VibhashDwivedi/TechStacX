const mongoose = require('mongoose');
const url ='mongodb+srv://vibhashdwivedi96:techstackx@cluster0.kunnu.mongodb.net/TechStackX?retryWrites=true&w=majority&appName=Cluster0'

//asynchronous function - returns a promise
mongoose.connect(url)
.then((result)=>{
    console.log('Connected to mongodb');
}).catch((err)=>{
     console.log(err);
});


module.exports = mongoose;