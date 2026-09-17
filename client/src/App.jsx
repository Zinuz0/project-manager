import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <main>
          <h2>Welcome to Project Manager</h2>
        </main>
      </div>
    </div>
  );
}

export default App;
