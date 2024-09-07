import React from 'react';
import {  BrowserRouter, Route, Routes } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import Flow from './components/Flow'; // Adjust the import path as necessary
import UploadPage from './components/Upload'; // Adjust the import path as necessary
import Navbar from './components/Navbar';


const App = () => {
  return (
    <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<ReactFlowProvider><Flow /></ReactFlowProvider>} />
      <Route path="/upload" element={<UploadPage />} />
    </Routes>
    </BrowserRouter>
   
  );
};

export default App;