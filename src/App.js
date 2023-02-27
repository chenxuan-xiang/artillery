import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GamePage from './pages/GamePage';
import EndPage from './pages/EndPage';
import NotFound from './pages/EndPage';
import Welcome from './pages/Welcome';

function App() {
  
  return (
    <>
      <Router>
        {/* <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav> */}

        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/end" element={<EndPage/>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
