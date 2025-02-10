import React, { useState } from 'react';

const PersonModal = ({ person, managers, reports, onClose, onPersonClick }) => {
  const [history, setHistory] = useState([{ person, managers, reports }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePersonClick = (newPerson, newManagers, newReports) => {
    // Remove any forward history when navigating to a new person
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push({ person: newPerson, managers: newManagers, reports: newReports });
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const current = history[currentIndex];

  const PersonCard = ({ person, isMain, onClick }) => (
    <div 
      className={`person-card ${isMain ? 'main' : ''}`}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
        <img 
          src={person.avatar} 
          alt={person.name} 
          style={{ 
            width: '60px', 
            height: '60px', 
            marginRight: '15px',
            borderRadius: '4px'
          }} 
        />
        <div>
          <h4>{person.name}</h4>
          <p className="title">{person.title}</p>
          <p className="department">{person.department}</p>
        </div>
      </div>
      {isMain && (
        <>
          <div className="person-details">
            <div className="detail-section">
              <h5>Contact Information</h5>
              <p>
                <strong>Phone:</strong> {person.phone}
              </p>
              <p>
                <strong>Email:</strong> {person.email}
              </p>
              <p>
                <strong>Teams:</strong> <a href={`https://teams.microsoft.com/l/chat/0/0?users=${person.teamsId}`} target="_blank" rel="noopener noreferrer">{person.teamsId}</a>
              </p>
              <p>
                <strong>Location:</strong> {person.location}
              </p>
            </div>
            <div className="detail-section">
              <h5>Employment Details</h5>
              <p>
                <strong>Directorate:</strong> {person.directorate}
              </p>
              <p>
                <strong>Supervisor:</strong> {person.supervisor || 'None'}
              </p>
              <p>
                <strong>Level:</strong> {person.level.charAt(0).toUpperCase() + person.level.slice(1)}
              </p>
              <p>
                <strong>Hire Date:</strong> {formatDate(person.hireDate)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-nav">
            <button 
              className="modal-nav-btn"
              onClick={handleBack}
              disabled={currentIndex === 0}
              title="Go back"
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <button 
              className="modal-nav-btn"
              onClick={handleForward}
              disabled={currentIndex === history.length - 1}
              title="Go forward"
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </button>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-grid">
          <div className="modal-column managers">
            <h3>Direct Managers</h3>
            {current.managers.length > 0 ? (
              <div className="person-list">
                {current.managers.map(manager => (
                  <PersonCard 
                    key={manager.id}
                    person={manager}
                    onClick={() => handlePersonClick(manager, [], [])}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-message">No direct managers</div>
            )}
          </div>

          <div className="modal-column">
            <h3>Selected Person</h3>
            <PersonCard 
              person={current.person}
              isMain={true}
            />
          </div>

          <div className="modal-column reports">
            <h3>Direct Reports</h3>
            {current.reports.length > 0 ? (
              <div className="person-list">
                {current.reports.map(report => (
                  <PersonCard 
                    key={report.id}
                    person={report}
                    onClick={() => handlePersonClick(report, [], [])}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-message">No direct reports</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonModal;
