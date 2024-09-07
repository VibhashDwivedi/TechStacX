require('dotenv').config(); // Load environment variables from .env file
const express = require("express"); // Import Express framework
const bodyParser = require("body-parser"); // Import body-parser for parsing request bodies
const multer = require("multer"); // Import multer for handling file uploads
const axios = require("axios"); // Import axios for making HTTP requests
const fs = require("fs"); // Import file system module
const csv = require("csvtojson"); // Import csvtojson for converting CSV to JSON
const { parse } = require("json2csv"); // Import json2csv for converting JSON to CSV
const cors = require("cors"); // Import cors for enabling Cross-Origin Resource Sharing
const { Server } = require("socket.io"); // Import socket.io for WebSocket communication
const http = require("http"); // Import HTTP module
const PREDEFINED_URL = process.env.PREDEFINED_URL; // Load predefined URL from environment variables

const app = express(); // Create an Express application
const upload = multer({ dest: "uploads/" }); // Configure multer to save uploaded files to "uploads/" directory

app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies

// Configure CORS options
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use CORS middleware with the specified options

const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("Client connected");
});

// Broadcast a message to all connected clients
const broadcast = (message) => {
  io.emit("message", message);
};

const Model = require("./model"); // Import the Workflow model

// Endpoint to save a workflow to the database
app.post("/api/workflows", async (req, res) => {
  const { id, nodes, edges } = req.body;

  if (!id || !nodes || !edges) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const workflow = new Model({ id, nodes, edges });
    await workflow.save();
    res.json({ message: "Workflow saved to database successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get all workflows from the database
app.get('/api/workflows', async (req, res) => {
  try {
    const workflows = await Model.find({});
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get a specific workflow by ID
app.get("/api/workflows/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const workflow = await Model.findOne({ id });
    if (workflow) {
      res.json(workflow);
    } else {
      res.status(404).json({ error: "Workflow not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to upload a file and execute a workflow
app.post("/api/upload", upload.single("file"), async (req, res) => {
  const nodeTypes = JSON.parse(req.body.nodeTypes);
  const workflow = JSON.parse(req.body.workflow);
  const filePath = req.file.path;

  console.log("Received node types:", nodeTypes);
  console.log("Received workflow:", workflow);

  if (
    !nodeTypes ||
    !Array.isArray(nodeTypes) ||
    !workflow ||
    !Array.isArray(workflow.nodes)
  ) {
    return res
      .status(400)
      .json({ error: "Invalid node types or workflow structure" });
  }

  try {
    let data_org = fs.readFileSync(filePath, "utf8");
    let data = data_org; // Initialize data with the original data

    for (const node of workflow.nodes) {
      console.log(`Processing node: ${node.type}`);
      broadcast({ node: node.type, status: "started" });

      switch (node.type) {
        case "filterData":
          data = await filterData(data_org);
          console.log("Filtered data:", data);
          break;
        case "wait":
          await wait();
          break;
        case "convertFormat":
          data = await convertFormat(data_org, data);
          console.log("Converted data:", data);
          break;
        case "sendPostRequest":
          await sendPostRequest(data, PREDEFINED_URL);
          break;
        default:
          break;
      }

      broadcast({ node: node.type, status: "completed" });
    }

    res.json({ message: "Workflow executed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(filePath); // Clean up the uploaded file
  }
});

// Function to filter data
const filterData = async (data) => {
  const jsonArray = await csv().fromString(data);
  const filteredData = jsonArray.map((row) => {
    const newRow = {};
    for (const key in row) {
      newRow[key] = row[key].toLowerCase();
    }
    return newRow;
  });
  const csvString = parse(filteredData);
  return csvString;
};

// Function to wait for a specified duration
const wait = () => {
  console.log("Wait started");
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log("Wait ended");
      resolve();
    }, 2000)
  );
};

// Function to convert data format
const convertFormat = async (data_org, data = null) => {
  // Use data_org if data is null or undefined
  const inputData = data || data_org;
  console.log("Input data for convertFormat:", inputData);

  // Check if the data is already in JSON format
  try {
    JSON.parse(inputData);
    console.log("Data is already in JSON format");
    return inputData; // Return the data as is if it's already JSON
  } catch (error) {
    console.log("Data is not in JSON format, converting...");
  }

  // Convert CSV to JSON
  const jsonArray = await csv().fromString(inputData);
  console.log("Converted JSON array:", jsonArray);

  const jsonString = JSON.stringify(jsonArray);
  console.log("Converted JSON string:", jsonString);

  return jsonString;
};

// Function to send a POST request
const sendPostRequest = async (data, url) => {
  console.log("Sending request to:", url);
  console.log("Payload:", data);

  // Ensure the data is a valid JSON string
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (error) {
    console.error("Invalid JSON data:", data);
    throw new Error(
      "Invalid JSON data. Make sure to convert Data to JSON before making Post Request"
    );
  }

  await axios.post(url, jsonData, {
    headers: { "Content-Type": "application/json" },
  });
};

// Start the server
server.listen(8000, () => {
  console.log("Server is running on port 8000");
});