const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const csv = require("csvtojson");
const { parse } = require("json2csv");
const cors = require("cors");
const PREDEFINED_URL = 'https://testing.requestcatcher.com/test'; // Replace with your RequestCatcher endpoint

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.json());

// Configure CORS to allow requests from localhost:3000
const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
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
    let data = fs.readFileSync(filePath, "utf8");

    for (const node of workflow.nodes) {
      switch (node.type) {
        case "filterData":
          data = await filterData(data);
          console.log("Filtered data:", data);
          break;
        case "wait":
          await wait();
          break;
        case "convertFormat":
          data = await convertFormat(data);
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
  const jsonArray = await csv().fromString(data);

  const jsonString = JSON.stringify(jsonArray);

  return jsonString;
};

const sendPostRequest = async (data, url) => {
  console.log('Sending POST request to:', url);
  console.log('Payload:', data);
  await axios.post(url, JSON.parse(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
