// Imports libraires
import React from 'react';
import PropTypes from 'prop-types';

// Imports services
import { changeStatus, setWinner } from '../service/matchesService';

const MatchList = ({ matchesPanel, matches, setMatches, handleDeleteMatch, setErrorMessage, setShowNotRegisterModal, loadAllWaitingList }) => {

  const chunkSize = 23;
  const chunks = [];
  
  for (let i = 0; i < matchesPanel.length; i += chunkSize) {
    chunks.push({id: i, value: matchesPanel.slice(i, i + chunkSize)});
  }

  const handleSetWinner = async (match, team) => {
    const oldWinner = match.winner;
    const oldStatus = match.status;
    match.winner = team;
    match.status = 2;
    updateMatches(match);
    const response = await setWinner(match.id, team);
    if([200, 201, 202, 203].includes(response)) {
      await loadAllWaitingList();
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
      return;
    }
    match.winner = oldWinner;
    match.status = oldStatus;
    updateMatches(match);
    setErrorMessage(`Une erreur est intervenue, le résultat n'a pas été modifié`);
    setShowNotRegisterModal(true);
  }

  const handleUnsetWinner = async (match) => {
    const oldWinner = match.winner;
    const oldStatus = match.status;
    match.winner = 0
    match.status = 1;
    updateMatches(match);
    const response = await setWinner(match.id, 0);
    if (response === 200) {
      await loadAllWaitingList();
      return;
    }
    if ([201, 202, 203].includes(response)) {
      setErrorMessage(`Impossible de changer le résultat, les équipes sont inscrites dans un autre match`);
      setShowNotRegisterModal(true);
    } else {
      setErrorMessage(`Une erreur est intervenue, le résultat n'a pas été modifié`);
      setShowNotRegisterModal(true);
    }
    match.winner = oldWinner;
    match.status = oldStatus
    updateMatches(match);
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
    const oldStatus = match.status;
    match.status = status;
    updateMatches(match);
    const responseStatus = await changeStatus(match.id);
    if (responseStatus !== 200) {
      match.status = oldStatus;
      updateMatches(match);
      setErrorMessage(`Une erreur est intervenue, le statut du match n'a pas pu être modifié`);
      setShowNotRegisterModal(true);
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
          {chunk.value.map((match) => (
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
            {match.status !== 2 && (
              <input
                type="checkbox"
                name={match.id}
                checked={match.status > 0}
                onChange={(e) => handleCheckboxChange(match, e.target.checked ? 1 : 0)}
              />
            )}
            {match.status === 0 && (
              <button 
                className="match-delete not-a-button" 
                onClick={() => handleDeleteMatch(match)}
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
  matches: PropTypes.object.isRequired,
  setMatches: PropTypes.func.isRequired,
  handleDeleteMatch: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setShowNotRegisterModal: PropTypes.func.isRequired,
  loadAllWaitingList: PropTypes.func.isRequired
};

export default MatchList;
