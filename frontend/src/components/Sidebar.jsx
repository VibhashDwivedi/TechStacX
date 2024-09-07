import React from 'react';
import '../index.css';

const Sidebar = () => {
  return (
    <div className="sidebar row">
      <h3 className="col-md-12 col-3 text-center border border-1 ">WorkFlow Nodes</h3>
     
      <div
        className="dndnode input element col-md-12 col-3 text-center" 
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'start')}
        draggable
      >
        Start
      </div>
      
      <div
        className="dndnode input element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'filterData')}
        draggable
      >
        Filter Data
      </div>
      <div
        className="dndnode element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'wait')}
        draggable
      >
        Wait
      </div>
      <div
        className="dndnode element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'convertFormat')}
        draggable
      >
        Convert Format
      </div>
      <div
        className="dndnode element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'sendPostRequest')}
        draggable
      >
        Send POST Request
      </div>
      <div
        className="dndnode input element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'end')}
        draggable
      >
       End
      </div>
    </div>
  );
};

export default Sidebar;