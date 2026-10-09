import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import Footer from './components/Footer';
import ReviewModal from './components/ReviewModal';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import './App.css';

export default function App() {
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
        <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar onOpenReview={() => setIsReviewOpen(true)} />

          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Home />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/about" element={<div style={{ padding: '4rem', textAlign: 'center' }}>About Page Coming Soon</div>} />
              <Route path="/contact" element={<div style={{ padding: '4rem', textAlign: 'center' }}>Contact Page Coming Soon</div>} />
            </Routes>
          </main>

          <Footer onOpenReview={() => setIsReviewOpen(true)} />
          <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
        </div>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  );
}