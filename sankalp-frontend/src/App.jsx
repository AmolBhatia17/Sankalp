import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import './App.css';

export default function App() {
  const handleOpenReview = () => {
    alert("Review modal will open here!");
  };

  return (
    <Router>
      <div className="app-layout">
        <Navbar onOpenReview={handleOpenReview} />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/courses" element={<div style={{ padding: '4rem', textAlign: 'center' }}>Courses Section Coming Soon</div>} />
          <Route path="/about" element={<div style={{ padding: '4rem', textAlign: 'center' }}>About Page Coming Soon</div>} />
          <Route path="/contact" element={<div style={{ padding: '4rem', textAlign: 'center' }}>Contact Page Coming Soon</div>} />
        </Routes>
      </div>
    </Router>
  );
}