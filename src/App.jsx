import React, { useState } from 'react';
import { orgData } from './data';
import OrgChart from './components/OrgChart';
import './App.css';

export default function App() {
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [directorateFilter, setDirectorateFilter] = useState('');
  const [zoom, setZoom] = useState(1.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('horizontal'); // 'horizontal' or 'vertical'
  
  const handleReset = () => {
    setEmployeeFilter('');
    setDirectorateFilter('');
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="app">
      <header>
        <h1>People Finder</h1>
        <p>Interactive Organization Chart</p>
      </header>
      
      <div className="content">
        <div className="toolbar">
          <div className="search-inputs">
            <div className="input-group">
              <label>
                <svg viewBox="0 0 24 24" width="16" height="16" className="filter-icon">
                  <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Highlight Employee
              </label>
              <div className="input-wrapper">
                <svg viewBox="0 0 24 24" width="16" height="16" className="search-icon">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="text"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>
                <svg viewBox="0 0 24 24" width="16" height="16" className="filter-icon">
                  <path fill="currentColor" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                </svg>
                Highlight Directorate
              </label>
              <div className="input-wrapper">
                <svg viewBox="0 0 24 24" width="16" height="16" className="search-icon">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="text"
                  value={directorateFilter}
                  onChange={(e) => setDirectorateFilter(e.target.value)}
                  placeholder="Enter directorate"
                />
              </div>
            </div>
            
            <div className="zoom-controls">
              <span>
                <svg viewBox="0 0 24 24" width="16" height="16" className="zoom-icon">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                Zoom: {zoom.toFixed(1)}
              </span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
            </div>

            <div className="toolbar-actions">
              <button onClick={handleReset} className="toolbar-btn reset-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" className="reset-icon">
                  <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
                Reset
              </button>
              <button onClick={handlePrint} className="toolbar-btn print-btn" title="Print">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                </svg>
              </button>
              <button onClick={toggleFullscreen} className="toolbar-btn fullscreen-btn" title="Toggle Fullscreen">
                {isFullscreen ? (
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={() => setViewMode(viewMode === 'horizontal' ? 'vertical' : 'horizontal')}
                className="toolbar-btn view-mode-btn"
                title="Toggle View Mode"
              >
                {viewMode === 'horizontal' ? (
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M4 18h17v-6H4v6zM4 5v6h17V5H4z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="chart-section">
          <OrgChart
            data={orgData}
            employeeFilter={employeeFilter}
            directorateFilter={directorateFilter}
            zoom={zoom}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  );
}
