import React from 'react';
import { Handle } from 'reactflow';

const FilterDataNode = ({ data }) => (
  <div className="node ">
    <Handle type="target" position="top" />
    <div>Filter Data </div>
    <Handle type="source" position="bottom" />
  </div>
);
const StartNode = ({ data }) => (
  <div className="node ">
    <Handle type="target" position="top" />
    <div>Start</div>
    <Handle type="source" position="bottom" />
  </div>
);
const EndNode = ({ data }) => (
  <div className="node ">
    <Handle type="target" position="top" />
    <div>End</div>
    <Handle type="source" position="bottom" />
  </div>
);

const WaitNode = ({ data }) => (
  <div className="node">
    <Handle type="target" position="top" />
    <div>Wait </div>
    <Handle type="source" position="bottom" />
  </div>
);

const ConvertFormatNode = ({ data }) => (
  <div className="node ">
    <Handle type="target" position="top" />
    <div>Convert Format</div>
    <Handle type="source" position="bottom" />
  </div>
);

const SendPostRequestNode = ({ data }) => (
  <div className="node ">
    <Handle type="target" position="top" />
    <div>Send POST Request </div>
    <Handle type="source" position="bottom" />
  </div>
);

export { FilterDataNode, WaitNode, ConvertFormatNode, SendPostRequestNode, StartNode, EndNode };