// Imports libraires
import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';

// Imports composants
import WaitingList from '../WaitingList/WaitingList';
import MatchList from '../MatchList';

// Imports services
import { luckyLoser } from '../../service/teamsService.js';
import { generate, ungenerate, launchMatches, setWinner, createMatch, deleteMatch} from "../../service/matchesService.js";

const Panel = ({ panel, panels, panelMatches, loadMatches, waitingsTeams, setWaitingsTeams, loadWaitingList, loadAllData, validateWinnerTeam, validateLoserTeam, handleSetWinner, setValidateWinnerTeam, setValidateLoserTeam, setGlobalSuccessMessage, setGlobalErrorMessage, matches, setMatches, setErrorMessage, setShowNotRegisterModal, loadAllWaitingList, startLoading, stopLoading }) => {

  const [createMatchTeam1, setCreateMatchTeam1] = useState(['' * 11]);
  const [createMatchTeam2, setCreateMatchTeam2] = useState(['' * 11]);
  const [luckyLoserTeam, setLuckyLoserTeam] = useState(['' * 11]);

  const loadPanel = useCallback(async(panelNumber) => {
    startLoading(`Chargement des données du tableau ${panelNumber}...`);
    try {
      const matchs = await loadMatches(panelNumber);
      const waitingTeams = await loadWaitingList(panelNumber);
      setMatches({ ...matches, [panelNumber]: matchs });
      setWaitingsTeams({ ...waitingsTeams, [panelNumber]: waitingTeams});
    } catch (error) {
      setGlobalErrorMessage(`Erreur lors du chargement des données initiales: ${error.message}`);
    } finally {
      stopLoading();
    }
  }, [loadMatches, loadWaitingList, startLoading, stopLoading, matches, setMatches, waitingsTeams, setWaitingsTeams, setGlobalErrorMessage]);

  const startMatches = async (panel) => {
    startLoading(`Démarrage des matchs du tableau ${panel}...`);
    try {
      const status = await launchMatches(panel);
      if (status !== 200) {
        setGlobalErrorMessage(`Erreur lors du démarrage des matchs: ${status}`);
        return;
      }
      await loadPanel(panel);
    } catch (error) {
      setGlobalErrorMessage(`Erreur lors du démarrage des matchs: ${error.message}`);
    } finally {
      stopLoading();
    }
  };

  const handleGenerate = async (panel) => {
    startLoading(`Génération des matchs du tableau ${panel}...`);
    await generate(parseInt(panel));
    await loadPanel(parseInt(panel));
    stopLoading();
  };

  const handleUngenerate = async (panel) => {
    startLoading(`Dégénération des matchs du tableau ${panel}...`);
    await ungenerate(parseInt(panel));
    await loadPanel(parseInt(panel));
    stopLoading();
  };

  const handleLuckyLoser = async (panel) => {
    const team = luckyLoserTeam[panel];
    if (team === '') {
      setGlobalErrorMessage('Veuillez entrer un numéro d\'équipe');
      return;
    }
    if (!/^\d+$/.test(team)) {
      setGlobalErrorMessage('Veuillez entrer un numéro d\'équipe valide');
      return;
    }
    startLoading('Repêchage ...');
    const status = await luckyLoser(panel, team);
    if ([204, 206, 207].includes(status)) {
      await loadAllData();
    }
    stopLoading();
    if (status === 201) {
      setGlobalErrorMessage(`L'équipe ${team} n'existe pas`);
    }
    else if (status === 202) {
      setGlobalErrorMessage(`L'équipe ${team} est déjà en lice au tour suivant`);
    }
    else if (status === 203) {
      setGlobalErrorMessage(`L'équipe ${team} est déjà dans un match sur ce tour`);
    }
    else if (status === 205) {
      setGlobalErrorMessage(`L'équipe ${team} est déjà dans la liste des équipes en attente`);
    }
    else {
      setGlobalSuccessMessage(`L'équipe ${team} a bien été repêchée`);
    }
    setLuckyLoserTeam({ ...luckyLoserTeam, [panel]: '' });
  };

  const handleCreateMatch = async (panel) => {
    const team1 = parseInt(createMatchTeam1[panel]);
    const team2 = parseInt(createMatchTeam2[panel]);

    if (!team1) {
      setGlobalErrorMessage('Veuillez entrer un numéro d\'équipe valide pour l\'équipe 1');
      return;
    }
    if (!team2) {
      setGlobalErrorMessage('Veuillez entrer un numéro d\'équipe valide pour l\'équipe 2');
      return;
    }
    if (team1 === team2) {
      setGlobalErrorMessage('Veuillez entrer deux numéros d\'équipes différents');
      return;
    }
    if (!waitingsTeams[panel]?.includes(team1)) {
      setGlobalErrorMessage(`L'équipe ${team1} n'est pas dans la liste des équipes en attente pour ce panel`);
      return;
    }
    if (!waitingsTeams[panel]?.includes(team2)) {
      setGlobalErrorMessage(`L'équipe ${team2} n'est pas dans la liste des équipes en attente pour ce panel`);
      return;
    }
    startLoading(`Création du match ...`);
    let response = await createMatch(parseInt(panel), team1, team2);
    if (response?.match) {
      setMatches({ ...matches, [panel]: [...matches[panel], response.match] });
      setWaitingsTeams({ ...waitingsTeams, [panel]: waitingsTeams[panel].filter(team => team !== team1 && team !== team2) });
      setCreateMatchTeam1({ ...createMatchTeam1, [panel]: '' });
      setCreateMatchTeam2({ ...createMatchTeam2, [panel]: '' });
    }
    if (response?.status === 201) {
      setGlobalErrorMessage('Erreur lors de la création du match');
    }
    stopLoading();
  };

  const handleSetLoser = async() => {
    if(validateLoserTeam) {
      const match = Object.values(matches)
        .flat()
        .find(m => ([m.team1, m.team2].includes(parseInt(validateLoserTeam))) && ([0, 1].includes(m.status)));
      if (!match) {
        setGlobalErrorMessage(`L'équipe ${validateLoserTeam} n'est affectée à aucun match en cours`);
        return;
      }
      const winner = match.team1 === validateLoserTeam ? match.team2 : match.team1;
      const status = await setWinner(match.id, parseInt(winner));
      if (status === 200) {
        const radio = document.querySelector(`input[type="radio"][name="${match.id}"][value="${winner}"]`);
        radio.checked = true;
        await radio.click();
        setValidateLoserTeam('');
      }
    } else {
      setGlobalErrorMessage('Veuillez sélectionner un perdant');
    }
  }

  const handleDeleteMatch = async (match) => {
    startLoading('Suppression du match ...');
    let status = await deleteMatch(match.id);
    if (status === 200) {
      await loadAllWaitingList();
      setMatches({ ...matches, [match.panel]: matches[match.panel].filter(m => m.id !== match.id) });
    }
    stopLoading();
  };

  return (
    <div key={panel} className="column">
      <div className="title">{panels.find(r => r.id === parseInt(panel))?.title}</div>
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
                matches={matches}
                setMatches={setMatches}
                handleDeleteMatch={handleDeleteMatch}
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

Panel.propTypes =  {
  panel: PropTypes.number.isRequired,
  panels: PropTypes.array.isRequired,
  panelMatches: PropTypes.array.isRequired,
  loadMatches: PropTypes.func.isRequired,
  waitingsTeams: PropTypes.object.isRequired,
  setWaitingsTeams: PropTypes.func.isRequired,
  loadWaitingList: PropTypes.func.isRequired,
  loadAllData: PropTypes.func.isRequired,
  validateWinnerTeam: PropTypes.string.isRequired,
  validateLoserTeam: PropTypes.string.isRequired,
  handleSetWinner: PropTypes.func.isRequired,
  setValidateWinnerTeam: PropTypes.func.isRequired,
  setValidateLoserTeam: PropTypes.func.isRequired,
  setGlobalSuccessMessage: PropTypes.func.isRequired,
  setGlobalErrorMessage: PropTypes.func.isRequired,
  matches: PropTypes.object.isRequired,
  setMatches: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setShowNotRegisterModal: PropTypes.func.isRequired,
  loadAllWaitingList: PropTypes.func.isRequired,
  startLoading: PropTypes.func.isRequired,
  stopLoading: PropTypes.func.isRequired
}

export default Panel;