const {model, Schema}= require('./connection');

const myschema = new Schema({
  id:{
    type: String,
    required: true,
    unique: true
  },
  nodeTypes: {
    type: [String], // Define an array of strings
    required: true // You can set this to false if it's not mandatory
  }
});
module.exports = model('Workflows', myschema);