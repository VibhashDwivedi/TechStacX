const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const csv = require("csvtojson");
const { parse } = require("json2csv");
const cors = require("cors");
const PREDEFINED_URL = "https://vibhash.requestcatcher.com/test";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.json());

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const workflow = JSON.parse(req.body.workflow);
  const filePath = req.file.path;

  const nodeTypes = workflow.nodes.map((node) => node.type);

  console.log("Received node types:", nodeTypes);

  if (!nodeTypes || !Array.isArray(nodeTypes) || nodeTypes.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid node types or workflow structure" });
  }

  try {
    let data_org = fs.readFileSync(filePath, "utf8");
    let data = data_org;

    for (const node of workflow.nodes) {
      switch (node.type) {
        case "filterData":
          data = await filterData(data_org);
          console.log("Filtered data:", data);
          break;
        case "wait":
          await wait();
          break;
        case "convertFormat":
          if (data === undefined) data = await convertFormat(data_org);
          else data = await convertFormat(data);
          console.log("Converted data:", data);
          break;
        case "sendPostRequest":
          await sendPostRequest(data, PREDEFINED_URL);
          break;
        default:
          break;
      }
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

const convertFormat = async (data) => {
  const inputData = data;

  // Check if the data is already in JSON format
  try {
    JSON.parse(inputData);
    return inputData; // Return the data as is if it's already JSON
  } catch (error) {}

  // Convert CSV to JSON
  const jsonArray = await csv().fromString(inputData);

  const jsonString = JSON.stringify(jsonArray);
  console.log("Converted JSON string:", jsonString);

  return jsonString;
};

const sendPostRequest = async (data, url) => {
  console.log("Sending POST request to:", url);
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
