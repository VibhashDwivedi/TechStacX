import React from 'react';
import { Handle } from 'reactflow'; // Import Handle component from reactflow

// FilterDataNode component
const FilterDataNode = ({ data }) => (
  <div className="node">
    <Handle type="target" position="top" /> {/* Input handle at the top */}
    <div>Filter Data</div> {/* Node label */}
    <Handle type="source" position="bottom" /> {/* Output handle at the bottom */}
  </div>
);

// StartNode component
const StartNode = ({ data }) => (
  <div className="node">
    <Handle type="target" position="top" /> {/* Input handle at the top */}
    <div>Start</div> {/* Node label */}
    <Handle type="source" position="bottom" /> {/* Output handle at the bottom */}
  </div>
);

// EndNode component
const EndNode = ({ data }) => (
  <div className="node">
    <Handle type="target" position="top" /> {/* Input handle at the top */}
    <div>End</div> {/* Node label */}
    <Handle type="source" position="bottom" /> {/* Output handle at the bottom */}
  </div>
);

// WaitNode component
const WaitNode = ({ data }) => (
  <div className="node">
    <Handle type="target" position="top" /> {/* Input handle at the top */}
    <div>Wait</div> {/* Node label */}
    <Handle type="source" position="bottom" /> {/* Output handle at the bottom */}
  </div>
);

// ConvertFormatNode component
const ConvertFormatNode = ({ data }) => (
  <div className="node">
    <Handle type="target" position="top" /> {/* Input handle at the top */}
    <div>Convert Format</div> {/* Node label */}
    <Handle type="source" position="bottom" /> {/* Output handle at the bottom */}
  </div>
);

// SendPostRequestNode component
const SendPostRequestNode = ({ data }) => (
  <div className="node">
    <Handle type="target" position="top" /> {/* Input handle at the top */}
    <div>Send POST Request</div> {/* Node label */}
    <Handle type="source" position="bottom" /> {/* Output handle at the bottom */}
  </div>
);

// Export all node components
export { FilterDataNode, WaitNode, ConvertFormatNode, SendPostRequestNode, StartNode, EndNode };