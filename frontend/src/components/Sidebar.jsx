import React from 'react';

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onTouchStart = (event, nodeType) => {
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('application/reactflow', nodeType);
      const dragEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });
      target.dispatchEvent(dragEvent);
    }
  };

  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'start')}
        onTouchStart={(event) => onTouchStart(event, 'start')}
        draggable
        data-reactflow="start"
      >
        Start Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'filterData')}
        onTouchStart={(event) => onTouchStart(event, 'filterData')}
        draggable
        data-reactflow="filterData"
      >
        Filter Data Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'wait')}
        onTouchStart={(event) => onTouchStart(event, 'wait')}
        draggable
        data-reactflow="wait"
      >
        Wait Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'convertFormat')}
        onTouchStart={(event) => onTouchStart(event, 'convertFormat')}
        draggable
        data-reactflow="convertFormat"
      >
        Convert Format Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'sendPostRequest')}
        onTouchStart={(event) => onTouchStart(event, 'sendPostRequest')}
        draggable
        data-reactflow="sendPostRequest"
      >
        Send Post Request Node
      </div>
      <div
        className="dndnode output"
        onDragStart={(event) => onDragStart(event, 'end')}
        onTouchStart={(event) => onTouchStart(event, 'end')}
        draggable
        data-reactflow="end"
      >
        End Node
      </div>
    </aside>
  );
};

export default Sidebar;