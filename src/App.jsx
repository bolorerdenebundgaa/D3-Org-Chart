import React, { useState } from 'react';
import { orgData } from './data';
import OrgChart from './components/OrgChart';
import './App.css';

export default function App() {
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [directorateFilter, setDirectorateFilter] = useState('');
  const [zoom, setZoom] = useState(1.8);
  
  const handleReset = () => {
    setEmployeeFilter('');
    setDirectorateFilter('');
  };

  return (
    <div className="app">
      <header>
        <h1>People Finder</h1>
        <p>Interactive Organization Chart</p>
      </header>
      
      <div className="content">
        <div className="search-section">
          <h2>Employee Search</h2>
          <div className="search-controls">
            <div className="search-inputs">
              <div className="input-group">
                <label>Highlight Employee</label>
                <input
                  type="text"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>
              
              <div className="input-group">
                <label>Highlight Directorate</label>
                <input
                  type="text"
                  value={directorateFilter}
                  onChange={(e) => setDirectorateFilter(e.target.value)}
                  placeholder="Enter directorate"
                />
              </div>
              
              <button onClick={handleReset} className="reset-btn">Reset</button>
            </div>
            
            <div className="zoom-controls">
              <span>Zoom: {zoom.toFixed(1)}</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
        
        <div className="chart-section">
          <h2>Organization Chart</h2>
          <OrgChart
            data={orgData}
            employeeFilter={employeeFilter}
            directorateFilter={directorateFilter}
            zoom={zoom}
          />
        </div>
      </div>
    </div>
  );
}
