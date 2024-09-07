const {model, Schema}= require('./connection');

const myschema = new Schema({
  id: { type: String, required: true, unique: true },
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
});
module.exports = model('Workflow', myschema);