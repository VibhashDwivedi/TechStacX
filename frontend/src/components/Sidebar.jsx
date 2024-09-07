import React from 'react';

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'start')}
        draggable
        data-reactflow="start"
      >
        Start Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'filterData')}
        draggable
        data-reactflow="filterData"
      >
        Filter Data Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'wait')}
        draggable
        data-reactflow="wait"
      >
        Wait Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'convertFormat')}
        draggable
        data-reactflow="convertFormat"
      >
        Convert Format Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'sendPostRequest')}
        draggable
        data-reactflow="sendPostRequest"
      >
        Send Post Request Node
      </div>
      <div
        className="dndnode output"
        onDragStart={(event) => onDragStart(event, 'end')}
        draggable
        data-reactflow="end"
      >
        End Node
      </div>
    </aside>
  );
};

export default Sidebar;