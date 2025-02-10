import React from 'react';

const PersonModal = ({ person, managers, reports, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-grid">
          {/* Left column - Managers */}
          <div className="modal-column managers">
            <h3>Direct Managers</h3>
            <div className="person-list">
              {managers.length > 0 ? (
                managers.map(manager => (
                  <div key={manager.id} className="person-card">
                    <h4>{manager.name}</h4>
                    <p className="title">{manager.title}</p>
                    <p className="department">{manager.department}</p>
                    <p className="level">{manager.level} {manager.tier}</p>
                  </div>
                ))
              ) : (
                <div className="empty-message">
                  No direct managers
                </div>
              )}
            </div>
          </div>

          {/* Center column - Selected Person */}
          <div className="modal-column selected">
            <h3>Selected Person</h3>
            <div className="person-card main">
              <h4>{person.name}</h4>
              <p className="title">{person.title}</p>
              <p className="department">{person.department}</p>
              <p className="level">{person.level} {person.tier}</p>
            </div>
          </div>

          {/* Right column - Direct Reports */}
          <div className="modal-column reports">
            <h3>Direct Reports</h3>
            <div className="person-list">
              {reports.length > 0 ? (
                reports.map(report => (
                  <div key={report.id} className="person-card">
                    <h4>{report.name}</h4>
                    <p className="title">{report.title}</p>
                    <p className="department">{report.department}</p>
                    <p className="level">{report.level} {report.tier}</p>
                  </div>
                ))
              ) : (
                <div className="empty-message">
                  No direct reports
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonModal;
