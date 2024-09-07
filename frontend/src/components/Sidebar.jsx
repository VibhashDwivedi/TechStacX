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
      >
        Start Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'filterData')}
        draggable
      >
        Filter Data Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'wait')}
        draggable
      >
        Wait Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'convertFormat')}
        draggable
      >
        Convert Format Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'sendPostRequest')}
        draggable
      >
        Send Post Request Node
      </div>
      <div
        className="dndnode output"
        onDragStart={(event) => onDragStart(event, 'end')}
        draggable
      >
        End Node
      </div>
    </aside>
  );
};

export default Sidebar;