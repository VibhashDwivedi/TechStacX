import React, { useState, useEffect } from 'react';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [workflowIds, setWorkflowIds] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');

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
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    if (!selectedWorkflowId) {
      alert('Please select a workflow ID.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      console.log('Uploaded data:', data);

      // Fetch the selected workflow
      const workflow = JSON.parse(localStorage.getItem(`workflow_${selectedWorkflowId}`));
      if (workflow) {
        const nodeTypes = workflow.nodes.map(node => node.type);
        console.log('Node types in order:', nodeTypes);

        // Send the file data and node types to the server or process as needed
        // Example:
        // fetch('/api/upload', {
        //   method: 'POST',
        //   body: JSON.stringify({ data, nodeTypes }),
        //   headers: { 'Content-Type': 'application/json' },
        // }).then(response => response.json()).then(result => {
        //   console.log('Server response:', result);
        // });

        alert('File and workflow data sent successfully.');
      } else {
        alert('Workflow not found.');
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
    </div>
  );
};

export default UploadPage;