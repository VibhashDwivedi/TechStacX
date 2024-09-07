import React, { useState, useEffect } from 'react';
import ReactFlow from 'react-flow-renderer';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Flow = () => {
  const [nodes, setNodes] = useState([]);
  const [workflow, setWorkflow] = useState(null);

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/workflow');
        const data = await response.json();
        setWorkflow(data);
      } catch (error) {
        console.error("Error loading workflow:", error);
        Swal.fire("Error", "Error loading workflow", "error");
      }
    };

    loadWorkflow();
  }, []);

  const handleDrop = (event) => {
    event.preventDefault();
    const reactFlowBounds = event.target.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };
    const newNode = {
      id: `${type}-${new Date().getTime()}`,
      type,
      position,
      data: { label: `${type} node` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleTouchStart = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('application/reactflow', event.target.dataset.reactflow);
    event.target.dispatchEvent(new DragEvent('dragstart', { dataTransfer }));
  };

  const handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      target.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
    }
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      target.dispatchEvent(new DragEvent('drop', { bubbles: true }));
    }
  };

  return (
    <div className="">
      <h1 className="text-center">Workflow Builder</h1>
      <div className="row d-flex vh-100">
        <div className="col-md-3">
          <Sidebar />
        </div>
        <div className="col-md-6" style={{ minHeight: "70%" }}>
          <div
            className="reactflow-wrapper"
            style={{ width: "100%", height: "100%" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <ReactFlow
              nodes={nodes}
              // Add other necessary props for ReactFlow
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flow;