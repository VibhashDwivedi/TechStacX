import React from 'react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div
        className="dndnode input"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'start')}
        draggable
      >
        Start
      </div>
      
      <div
        className="dndnode input"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'filterData')}
        draggable
      >
        Filter Data
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'wait')}
        draggable
      >
        Wait
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'convertFormat')}
        draggable
      >
        Convert Format
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'sendPostRequest')}
        draggable
      >
        Send POST Request
      </div>
      <div
        className="dndnode input"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'end')}
        draggable
      >
       End
      </div>
    </div>
  );
};

export default Sidebar;