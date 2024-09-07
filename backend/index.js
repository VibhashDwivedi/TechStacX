const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const csv = require("csvtojson");
const { parse } = require("json2csv");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const PREDEFINED_URL = "https://vibhash.requestcatcher.com/test";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.json());

const corsOptions = {
  origin: "http://localhost:3000" || "https://tech-stac-x.vercel.app/",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://tech-stac-x.vercel.app/" || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");
});

const broadcast = (message) => {
  io.emit("message", message);
};

const Model = require("./model");



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

app.get('/api/workflows', async (req, res) => {
  try {
    const workflows = await Model.find({});
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

const wait = () => {
  console.log("Wait started");
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log("Wait ended");
      resolve();
    }, 2000)
  );
};

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

server.listen(8000, () => {
  console.log("Server is running on port 8000");
});
