import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ProgressBar } from 'react-bootstrap';
import Swal from 'sweetalert2';
import Dropzone from 'react-dropzone';
import 'bootstrap/dist/css/bootstrap.min.css';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(''); // State for file name
  const [workflowIds, setWorkflowIds] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const [progress, setProgress] = useState(0); // State for progress
  const [currentNode, setCurrentNode] = useState(''); // State for current node
  const [totalNodes, setTotalNodes] = useState(0); // State for total nodes

  useEffect(() => {
    // Fetch workflow IDs from backend
    const fetchWorkflows = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/workflows');
        const data = await response.json();
        setWorkflowIds(data.map(workflow => workflow.id));
      } catch (error) {
        console.error('Error fetching workflows:', error);
      }
    };

    fetchWorkflows();

    // Connect to WebSocket server
    const socket = io('http://localhost:8000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('message', (message) => {
      const data = message;
      if (data.status === 'started') {
        setCurrentNode(`Executing node: ${data.node}`);
      } else if (data.status === 'completed') {
        setCurrentNode(`Completed node: ${data.node}`);
        setProgress((prevProgress) => prevProgress + (100 / totalNodes));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [totalNodes]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire('Error', 'Please select a file to upload.', 'error');
      return;
    }

    if (!selectedWorkflowId) {
      Swal.fire('Error', 'Please select a workflow ID.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target.result;

      // Fetch the selected workflow from the backend
      try {
        const response = await fetch(`http://localhost:8000/api/workflows/${selectedWorkflowId}`);
        if (response.ok) {
          const workflow = await response.json();

          if (workflow && Array.isArray(workflow.nodes)) {
            const nodeTypes = workflow.nodes.map((node) => node.type);
            console.log('Node types to be sent:', nodeTypes);

            // Filter out 'start' and 'end' nodes
            const filteredNodeTypes = nodeTypes.filter(type => type !== 'start' && type !== 'end');

            // Set total nodes for progress calculation
            setTotalNodes(filteredNodeTypes.length);

            // Send the file data and node types to the server
            const formData = new FormData();
            formData.append('file', file);
            formData.append('nodeTypes', JSON.stringify(nodeTypes));
            formData.append('workflow', JSON.stringify(workflow));

            try {
              setProgress(0); // Reset progress
              const response = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData,
              });
              const result = await response.json();
              console.log('Server response:', result);

              if (response.ok) {
                Swal.fire('Success', result.message, 'success');
              } else {
                Swal.fire('Error', result.error, 'error');
              }
            } catch (error) {
              console.error('Error uploading data:', error);
              Swal.fire('Error', 'Error uploading data.', 'error');
            }
          } else {
            Swal.fire('Error', 'Workflow not found or invalid.', 'error');
          }
        } else {
          Swal.fire('Error', 'Failed to fetch workflow from backend.', 'error');
        }
      } catch (error) {
        console.error('Error fetching workflow:', error);
        Swal.fire('Error', 'An error occurred while fetching the workflow.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container px-5">
      <h2>Upload Data</h2>
      <Dropzone onDrop={acceptedFiles => {
        setFile(acceptedFiles[0]);
        setFileName(acceptedFiles[0].name);
      }}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps({ className: 'dropzone border border-4 border-black p-5 text-center' })}>
            <input {...getInputProps()} />
            <i className="fa-solid fa-3x fa-upload"></i>
            <h3>Drag and Drop files here to Upload </h3>
            <div className='btn btn-outline-dark p-2 mt-2 fs-4'>or Select a file to upload</div>
            {fileName && <p className="mt-2">{fileName}</p>}
          </div>
        )}
      </Dropzone>
      <div className="form-group mt-3">
        <label htmlFor="workflow-select">Select Workflow ID:</label>
        <select
          id="workflow-select"
          className="form-control"
          value={selectedWorkflowId}
          onChange={(e) => setSelectedWorkflowId(e.target.value)}
        >
          <option value="">--Select Workflow--</option>
          {workflowIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary mt-3" onClick={handleUpload}>Send</button>
      <div className="mt-3">
        <ProgressBar now={progress} />
      </div>
      {currentNode && <p className="mt-3">{currentNode}</p>} {/* Display current node */}
    </div>
  );
};

export default UploadPage;