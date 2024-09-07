const { model, Schema } = require('./connection'); // Import model and Schema from the connection module

// Define the schema for the Workflow model
const myschema = new Schema({
  id: { type: String, required: true, unique: true }, // Unique identifier for the workflow
  nodes: { type: Array, required: true }, // Array of nodes in the workflow
  edges: { type: Array, required: true }, // Array of edges connecting the nodes
});

// Export the Workflow model based on the defined schema
module.exports = model('Workflow', myschema);