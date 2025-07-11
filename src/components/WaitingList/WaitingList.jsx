import React from 'react';
import PropTypes from 'prop-types';
import './WaitingList.css';

const WaitingList = ({ teams }) => {
  // Diviser les équipes en groupes de 40
  const chunkSize = 40;
  const chunks = [];
  
  for (let i = 0; i < teams.length; i += chunkSize) {
    chunks.push(teams.slice(i, i + chunkSize));
  }

  return (
    <div className="waiting-lists-container">
      {chunks.map((chunk, index) => (
        <div key={index} className="waiting-list">
          {chunk.map((team) => (
            <div key={team} className="waiting-team">{team}</div>
          ))}
        </div>
      ))}
    </div>
  );
};

WaitingList.propTypes = {
  teams: PropTypes.array.isRequired,
};

export default WaitingList;