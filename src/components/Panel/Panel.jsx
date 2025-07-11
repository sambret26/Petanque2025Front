import React from 'react';
import WaitingList from '../WaitingList/WaitingList';
import MatchList from '../MatchList';

const Panel = ({ panel, panels, panelMatches, waitingsTeams, createMatchTeam1, createMatchTeam2, validateWinnerTeam, validateLoserTeam, luckyLoserTeam, handleGenerate, handleUngenerate, startMatches, handleLuckyLoser, handleCreateMatch, handleSetWinner, handleSetLoser, handleDeleteMatch, setCreateMatchTeam1, setCreateMatchTeam2, setValidateWinnerTeam, setValidateLoserTeam, setLuckyLoserTeam, setGlobalErrorMessage, matches, setMatches, deleteMatch, setErrorMessage, setShowNotRegisterModal, loadAllWaitingList, setWinner, changeStatus }) => {
  return (
    <div key={panel} className="column">
      <div className="title">{panels.find(r => r.id === parseInt(panel))?.title || `Round ${panel}`}</div>
      <div className="content">
        <div className="sub-columns">
          <div className="waiting-list-global">
            <div className="header-title">Triplettes en attente</div>
            <div className="sub-column sub-column-waiting">
              <WaitingList
                teams={waitingsTeams[panel]}
              />
            </div>
          </div>
          <div className="match-list match-list-global">
            <div className="header-title">Matchs</div>
            <div className="match-controls-container">
              {/* Colonne création de match */}
              <div className="match-column col1">
                <div className="match-row">
                  <input
                    id={`match-team1-input-${panel}`}
                    className="match-input team-input"
                    placeholder="Equipe 1"
                    value={createMatchTeam1[panel] || ''}
                    autoComplete="off"
                    onChange={(e) => setCreateMatchTeam1({...createMatchTeam1, [panel]: e.target.value})}
                  />
                  <span className="vs-text">vs</span>
                  <input
                    id={`match-team2-input-${panel}`}
                    className="match-input team-input"
                    placeholder="Equipe 2"
                    value={createMatchTeam2[panel] || ''}
                    autoComplete="off"
                    onChange={(e) => setCreateMatchTeam2({...createMatchTeam2, [panel]: e.target.value})}
                  />
                </div>
                <div className="match-row">
                  <button className="validate-btn blue" onClick={() => handleCreateMatch(panel)}>
                    Créer match
                  </button>
                </div>
              </div>
              {/* Colonne validation de match */}
              <div className="match-column col2">
                <div className="match-row">
                  <input
                    id={`winner-input-${panel}`}
                    className="match-input winner-input"
                    placeholder="Vainqueur"
                    value={validateWinnerTeam}
                    autoComplete="off"
                    onChange={(e) => setValidateWinnerTeam(e.target.value)}
                  />
                </div>
                <div className="match-row">
                  <button className="validate-btn green" onClick={() => handleSetWinner()}>
                    Valider vainqueur
                  </button>
                </div>
              </div>
              {/* Colonne validation de perdant */}
              <div className="match-column col3">
                <div className="match-row">
                  <input
                    id={`loser-input-${panel}`}
                    className="match-input loser-input"
                    placeholder="Perdant"
                    value={validateLoserTeam}
                    autoComplete="off"
                    onChange={(e) => setValidateLoserTeam(e.target.value)}
                  />
                </div>
                <div className="match-row">
                  <button className="validate-btn red" onClick={() => handleSetLoser()}>
                    Valider perdant
                  </button>
                </div>
              </div>
            </div>
            <div className="sub-column sub-column-match">
              <MatchList
                matchesPanel={panelMatches}
                panel={parseInt(panel)}
                onRadioChange={setWinner}
                onCheckboxChange={changeStatus}
                setGlobalErrorMessage={setGlobalErrorMessage}
                matches={matches}
                setMatches={setMatches}
                deleteMatch={handleDeleteMatch}
                setErrorMessage={setErrorMessage}
                setShowNotRegisterModal={setShowNotRegisterModal}
                loadAllWaitingList={loadAllWaitingList}
              />
            </div>
          </div>
        </div>
        <div className="footer-container">
          <div className="footer">
            <button
              className="blue"
              onClick={() => handleGenerate(parseInt(panel))}
            >
              Générer les matchs
            </button>
            <button
              className="red"
              onClick={() => handleUngenerate(parseInt(panel))}
            >
              Défaire les matchs
            </button>
            <button
              className="blue"
              onClick={() => startMatches(parseInt(panel))}
            >
              Lancer les matchs
            </button>
            <input
              id={`lucky-loser-${panel}`}
              className="match-input lucky-loser real-input"
              placeholder="Equipe"
              value={luckyLoserTeam[panel]}
              autoComplete="off"
              onChange={(e) => setLuckyLoserTeam({ ...luckyLoserTeam, [panel]: e.target.value })}
            />
            <button
              className="yellow"
              onClick={() => handleLuckyLoser(parseInt(panel))}
            >
              Repêcher
            </button>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Panel;