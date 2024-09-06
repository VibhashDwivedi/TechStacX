import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './Sidebar'; // Adjust the import path as necessary

import {
  StartNode,
  FilterDataNode,
  WaitNode,
  ConvertFormatNode,
  SendPostRequestNode,
  EndNode,
} from './NodeComponents'; // Adjust the import path as necessary

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

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
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
    const type = event.dataTransfer.getData('application/reactflow');
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
    event.dataTransfer.dropEffect = 'move';
  };

  const saveWorkflow = () => {
    const id = workflowId || uuidv4();
    const workflow = { id, nodes, edges };
    localStorage.setItem(`workflow_${id}`, JSON.stringify(workflow));
    setWorkflowId(id);
    alert(`Workflow saved with ID: ${id}`);
  };

  const loadWorkflow = (id) => {
    const workflow = JSON.parse(localStorage.getItem(`workflow_${id}`));
    if (workflow) {
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      setWorkflowId(id);
    } else {
      alert(`No workflow found with ID: ${id}`);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <Sidebar />
      <div
        className="reactflow-wrapper"
        style={{ width: '100%', height: '100%' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
      <div className="controls">
        <button onClick={saveWorkflow}>Save Workflow</button>
        <input
          type="text"
          placeholder="Enter Workflow ID"
          onBlur={(e) => loadWorkflow(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Flow;