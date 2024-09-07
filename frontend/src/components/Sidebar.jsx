import React from 'react'; // Import React
import '../index.css'; // Import custom styles

// Sidebar component
const Sidebar = () => {
  return (
    <div className="sidebar row">
      {/* Start Node */}
      <div
        className="dndnode input element col-md-12 col-3 text-center" 
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'start')} // Set data for drag event
        draggable // Make the element draggable
      >
        Start
      </div>
      
      {/* Filter Data Node */}
      <div
        className="dndnode input element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'filterData')} // Set data for drag event
        draggable // Make the element draggable
      >
        Filter Data
      </div>
      
      {/* Wait Node */}
      <div
        className="dndnode element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'wait')} // Set data for drag event
        draggable // Make the element draggable
      >
        Wait
      </div>
      
      {/* Convert Format Node */}
      <div
        className="dndnode element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'convertFormat')} // Set data for drag event
        draggable // Make the element draggable
      >
        Convert Format
      </div>
      
      {/* Send POST Request Node */}
      <div
        className="dndnode element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'sendPostRequest')} // Set data for drag event
        draggable // Make the element draggable
      >
        Send POST Request
      </div>
      
      {/* End Node */}
      <div
        className="dndnode input element col-md-12 col-3 text-center"
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'end')} // Set data for drag event
        draggable // Make the element draggable
      >
        End
      </div>
    </div>
  );
};

export default Sidebar; // Export Sidebar component