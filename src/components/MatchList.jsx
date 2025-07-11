import React from 'react';
import PropTypes from 'prop-types';

const MatchList = ({ matchesPanel, panel, onRadioChange, onCheckboxChange, setGlobalErrorMessage, matches, setMatches, deleteMatch, setErrorMessage, setShowNotRegisterModal, loadAllWaitingList }) => {

  const chunkSize = 23;
  const chunks = [];
  
  for (let i = 0; i < matchesPanel.length; i += chunkSize) {
    chunks.push(matchesPanel.slice(i, i + chunkSize));
  }

  const handleSetWinner = async (match, team) => {
    const response = await onRadioChange(match.id, team);
    if (response) {
      match.winner = team
      match.status = 2;
      updateMatches(match);
      await loadAllWaitingList();
    }
    if (response === 201) {
      let loser = match.team1 === match.winner ? match.team2 : match.team1;
      setErrorMessage(`Les équipes suivantes n'ont pas été inscrites au tour suivant car elles ont déjà un match prévu: ${loser}`);
      setShowNotRegisterModal(true);
    } else if (response === 202) {
      setErrorMessage(`Les équipes suivantes n'ont pas été inscrites au tour suivant car elles ont déjà un match prévu: ${match.winner}`);
      setShowNotRegisterModal(true);
    } else if (response === 203) {
      setErrorMessage(`Les équipes suivantes n'ont pas été inscrites au tour suivant car elles ont déjà un match prévu: ${match.team1 + " et " + match.team2}`);
      setShowNotRegisterModal(true);
    }
  }

  const handleUnsetWinner = async (match) => {
    const response = await onRadioChange(match.id, 0);
    if (response === 200) {
      match.winner = 0
      match.status = 1;
      updateMatches(match);
      await loadAllWaitingList();
    } else {
      setErrorMessage(`Impossible de changer le résultat, les équipes sont inscrites dans un autre match`);
      setShowNotRegisterModal(true);
    }
  }

  const handleRadioChange = async (matchId, team) => {
    const match = matchesPanel.find(m => m.id === matchId);
    if (match) {
      if(match.winner === 0 || match.winner !== team) {
        await handleSetWinner(match, team)
      } else {
        await handleUnsetWinner(match)
      }
    }
  };

  const updateMatches = (match) => {
    setMatches({ ...matches, [match.panel]: matchesPanel.map(m => m.id === match.id ? match : m) });
  }

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); // Empêche le changement automatique de sélection
    }
  };

  const handleCheckboxChange = async (match, status) => {
    if (match.status !== 2) {
      match.status = status;
      updateMatches(match);
      
      const matchDiv = document.querySelector(`.match-${match.id}`);
      if (matchDiv !== null) {
        matchDiv.style.backgroundColor = status > 0 ? 'orange' : '';
      }
      
      // Appeler la fonction de callback
      await onCheckboxChange(match.id);
    } else {
      setGlobalErrorMessage('Le match est deja terminé');
    }
  };

  const getBackgroundColor = (match) => {
    if (match.winner) {
      return 'green';
    } else if (match.status > 0) {
      return 'orange';
    } else {
      return '';
    }
  }

  return (
    <div className="match-list-container">
      {chunks.map((chunk) => (
        <div key={chunk.id} className="match-list">
          {chunk.map((match) => (
            <div 
              key={match.id}
              className={`match match-${match.id}`}
              style={{
                backgroundColor: getBackgroundColor(match)
              }}
            >
            <span className="match-label">{match.team1}</span>
            <input
              type="radio"
              name={match.id}
              value={match.team1}
              checked={match.winner === match.team1}
              onChange={() => {}} // Gestionnaire vide car on utilise onClick
              onClick={async () => await handleRadioChange(match.id, match.team1)}
              onKeyDown={handleKeyDown}
            />
            <input
              type="radio"
              name={match.id}
              value={match.team2}
              checked={match.winner === match.team2}
              onChange={() => {}} // Gestionnaire vide car on utilise onClick
              onClick={async () => await handleRadioChange(match.id, match.team2)}
              onKeyDown={handleKeyDown}
            />
            <span className="match-label">{match.team2}</span>
            <input
              type="checkbox"
              name={match.id}
              checked={match.status > 0}
              onChange={(e) => handleCheckboxChange(match, e.target.checked ? 1 : 0)}
            />
            {match.status === 0 && (
              <button 
                className="match-delete not-a-button" 
                onClick={() => deleteMatch(match)}
              >&#10060;</button>
            )}
          </div>
        ))}
      </div>
      ))}
    </div>
  );
};

MatchList.propTypes = {
  matchesPanel: PropTypes.array.isRequired,
  panel: PropTypes.number.isRequired,
  onRadioChange: PropTypes.func.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  setGlobalErrorMessage: PropTypes.func.isRequired,
  matches: PropTypes.object.isRequired,
  setMatches: PropTypes.func.isRequired,
  deleteMatch: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setShowNotRegisterModal: PropTypes.func.isRequired,
  loadAllWaitingList: PropTypes.func.isRequired
};

export default MatchList;
