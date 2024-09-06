import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [workflowIds, setWorkflowIds] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const [progress, setProgress] = useState(0); // State for progress
  const [currentNode, setCurrentNode] = useState(''); // State for current node
  const [totalNodes, setTotalNodes] = useState(0); // State for total nodes

  useEffect(() => {
    // Fetch workflow IDs from local storage
    const ids = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('workflow_')) {
        ids.push(key.replace('workflow_', ''));
      }
    }
    setWorkflowIds(ids);

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
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    if (!selectedWorkflowId) {
      alert('Please select a workflow ID.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target.result;

      // Fetch the selected workflow
      const workflow = JSON.parse(localStorage.getItem(`workflow_${selectedWorkflowId}`));

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
            alert(result.message);
          } else {
            alert(result.error);
          }
        } catch (error) {
          console.error('Error uploading data:', error);
          alert('Error uploading data.');
        }
      } else {
        alert('Workflow not found or invalid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Data</h2>
      <input type="file" onChange={handleFileChange} />
      <div>
        <label htmlFor="workflow-select">Select Workflow ID:</label>
        <select
          id="workflow-select"
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
      <button onClick={handleUpload}>Send</button>
      <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
      {currentNode && <p>{currentNode}</p>} {/* Display current node */}
    </div>
  );
};

export default UploadPage;