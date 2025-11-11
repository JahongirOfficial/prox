import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/courses" element={<Index />} />
        <Route path="/projects" element={<Index />} />
        <Route path="/projects/blogs" element={<Index />} />
        <Route path="/projects/resume" element={<Index />} />
        <Route path="/projects/payments" element={<Index />} />
        <Route path="/my-courses" element={<Index />} />
        <Route path="/offline" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
