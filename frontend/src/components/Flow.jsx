import React, { useCallback, useState, useEffect } from "react"; // Import necessary React hooks
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from "reactflow"; // Import components and hooks from reactflow library
import "reactflow/dist/style.css"; // Import reactflow styles
import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique IDs
import Swal from "sweetalert2"; // Import SweetAlert2 for alerts
import Sidebar from "./Sidebar"; // Import Sidebar component
import "../index.css"; // Import custom styles
import {
  StartNode,
  FilterDataNode,
  WaitNode,
  ConvertFormatNode,
  SendPostRequestNode,
  EndNode,
} from "./NodeComponents"; // Import custom node components

const BACKEND_URL = "http://localhost:8000"; // Update backend URL according to your backend server

// Initial state for nodes and edges
const initialNodes = [];
const initialEdges = [];

// Define custom node types
const nodeTypes = {
  start: StartNode,
  filterData: FilterDataNode,
  wait: WaitNode,
  convertFormat: ConvertFormatNode,
  sendPostRequest: SendPostRequestNode,
  end: EndNode,
};

const Flow = () => {
  // State hooks for nodes, edges, and workflow IDs
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { project } = useReactFlow();
  const [workflowId, setWorkflowId] = useState(null);
  const [workflowIds, setWorkflowIds] = useState([]);
  const [workflowLoaded, setWorkflowLoaded] = useState(false); // State to trigger re-render

  // Fetch workflow IDs from backend
  const fetchWorkflows = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows`);
      const data = await response.json();
      setWorkflowIds(data.map((workflow) => workflow.id));
    } catch (error) {
      console.error("Error fetching workflows:", error);
    }
  };
  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Add a new node to the workflow
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

  // Handle drop event to add a new node
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

  // Handle drag over event
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // Handle touch start event for mobile devices
  const handleTouchStart = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const dataTransfer = new DataTransfer();
    dataTransfer.setData(
      "application/reactflow",
      event.target.dataset.reactflow
    );
    event.target.dispatchEvent(new DragEvent("dragstart", { dataTransfer }));
  };

  // Handle touch move event for mobile devices
  const handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      target.dispatchEvent(new DragEvent("dragover", { bubbles: true }));
    }
  };

  // Handle touch end event for mobile devices
  const handleTouchEnd = (event) => {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      target.dispatchEvent(new DragEvent("drop", { bubbles: true }));
    }
  };

  // Save the current workflow to the backend
  const saveWorkflow = async () => {
    // Check if nodes and edges are empty
    if (nodes.length === 0 || edges.length === 0) {
      Swal.fire("Error", "Nodes and edges cannot be empty", "error");
      return;
    }

    const id = workflowId || uuidv4();
    const workflow = { id, nodes, edges };

    // Send POST request to backend
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows`, {
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

  // Load a workflow from the backend
  const loadWorkflow = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/${id}`);
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
          <h3 className="text-center">WorkFlow Nodes</h3>
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
            <button className="btn btn-primary m-2" onClick={saveWorkflow}>
              Save Workflow
            </button>
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