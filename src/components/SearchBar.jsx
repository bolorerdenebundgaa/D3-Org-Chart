import React from 'react';

export default function SearchBar({
  employeeFilter,
  directorateFilter,
  setEmployeeFilter,
  setDirectorateFilter,
  zoom,
  setZoom
}) {
  const handleReset = () => {
    setEmployeeFilter('');
    setDirectorateFilter('');
  };

  return (
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
  );
}
