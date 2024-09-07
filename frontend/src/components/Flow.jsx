import React, { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import Sidebar from "./Sidebar"; // Adjust the import path as necessary
import "../index.css";

import {
  StartNode,
  FilterDataNode,
  WaitNode,
  ConvertFormatNode,
  SendPostRequestNode,
  EndNode,
} from "./NodeComponents"; // Adjust the import path as necessary

const initialNodes = [];
const initialEdges = [];

const nodeTypes = {
  start: StartNode,
  filterData: FilterDataNode,
  wait: WaitNode,
  convertFormat: ConvertFormatNode,
  sendPostRequest: SendPostRequestNode,
  end: EndNode,
};

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { project } = useReactFlow();
  const [workflowId, setWorkflowId] = useState(null);
  const [workflowIds, setWorkflowIds] = useState([]);
  const [workflowLoaded, setWorkflowLoaded] = useState(false); // State to trigger re-render

  // Fetch workflow IDs from backend
  const fetchWorkflows = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/workflows");
      const data = await response.json();
      setWorkflowIds(data.map((workflow) => workflow.id));
    } catch (error) {
      console.error("Error fetching workflows:", error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type, position) => {
    console.log(`Adding node of type ${type} at position`, position);
    const newNode = {
      id: (nodes.length + 1).toString(),
      type,
      position,
      data: { label: `${type} Node ${nodes.length + 1}` },
    };
    setNodes((nds) => nds.concat(newNode));
    return newNode;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow");
    const position = project({ x: event.clientX, y: event.clientY });
    console.log(`Dropped node of type ${type} at position`, position);
    const newNode = addNode(type, position);

    // Optionally, connect the new node to an existing node
    if (nodes.length > 0) {
      const sourceNode = nodes[nodes.length - 1];
      const newEdge = {
        id: `e${sourceNode.id}-${newNode.id}`,
        source: sourceNode.id,
        target: newNode.id,
      };
      setEdges((eds) => eds.concat(newEdge));
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.dataset.reactflow) {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('application/reactflow', target.dataset.reactflow);
      const dragEvent = new DragEvent('dragstart', { dataTransfer });
      target.dispatchEvent(dragEvent);
    }
  };

  const handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      const dragEvent = new DragEvent('dragover', { bubbles: true });
      target.dispatchEvent(dragEvent);
    }
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      const dragEvent = new DragEvent('drop', { bubbles: true });
      target.dispatchEvent(dragEvent);
    }
  };

  const saveWorkflow = async () => {
    const id = workflowId || uuidv4();
    const workflow = { id, nodes, edges };

    // Send POST request to backend
    try {
      const response = await fetch("http://localhost:8000/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflow), // Send the entire workflow object
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Workflow saved successfully:", result);
        Swal.fire("Success", `Workflow saved with ID: ${id}`, "success");
        // Fetch updated list of workflows
        fetchWorkflows();
      } else {
        const error = await response.json();
        console.error("Error saving workflow:", error);
        Swal.fire("Error", "Error saving workflow", "error");
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      Swal.fire("Error", "Error saving workflow", "error");
    }
  };

  const loadWorkflow = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/workflows/${id}`);
      if (response.ok) {
        const workflow = await response.json();
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        setWorkflowId(id);
        setWorkflowLoaded(true); // Trigger re-render
      } else {
        Swal.fire("Not Found", `No workflow found with ID: ${id}`, "warning");
      }
    } catch (error) {
      console.error("Error loading workflow:", error);
      Swal.fire("Error", "Error loading workflow", "error");
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
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>
        <div className="col-md-3">
          <div className="controls">
            <button className="btn btn-primary m-2" onClick={saveWorkflow}>Save Workflow</button>
            <input
              type="text"
              className="form-control w-75 m-2"
              placeholder="Enter Workflow ID"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loadWorkflow(e.target.value);
                }
              }}
            />
            <select
              value={workflowId}
              className="form-control w-75 m-2"
              onChange={(e) => loadWorkflow(e.target.value)}
            >
              <option value="">--Select Workflow--</option>
              {workflowIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flow;