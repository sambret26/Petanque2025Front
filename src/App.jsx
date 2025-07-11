// Imports libraires
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal as AntModal, Button, message } from 'antd';

// Imports composants
import ColumnSlider from "./components/ColumnSlider/ColumnSlider.jsx";
import KeyHandler from "./components/KeyHandler";
import Loader from "./components/Loader/Loader";
import Panel from "./components/Panel/Panel.jsx";

// Imports services
import { getMatches, setWinner} from "./service/matchesService.js";
import { getNumber, getWaiting, register, unregister } from "./service/teamsService.js";
import { init } from "./service/tournamentService.js";

// Imports utils et tech
import { getStageAndCategorieByValue } from "./utils/Utils.jsx";
import { useDisableSwipeBack } from "./utils/Tech.jsx";

// Imports styles
import "./styles/modals.css";

const App = () => {
  // Désactive le geste de retour arrière avec le trackpad
  useDisableSwipeBack();

  // États principaux
  const [waitingsTeams, setWaitingsTeams] = useState({});
  const [totalTeam, setTotalTeam] = useState(0);
  const [matches, setMatches] = useState({});

  // États pour le loader
  const [loaderMessage, setLoaderMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // États pour les modales
  const [showNotRegisterModal, setShowNotRegisterModal] = useState(false);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [keyHandlerEnabled, setKeyHandlerEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // États pour les messages globaux
  const [globalSuccessMessage, setGlobalSuccessMessage] = useState('');
  const [globalErrorMessage, setGlobalErrorMessage] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  // États pour les inputs
  const [unregisterTeamNumber, setUnregisterTeamNumber] = useState('');
  const [validateWinnerTeam, setValidateWinnerTeam] = useState('');
  const [validateLoserTeam, setValidateLoserTeam] = useState('');
  const [teamToRegister, setTeamToRegister] = useState('');
  const [initConfirm, setInitConfirm] = useState('');

  // Définition des panels
  const panels = useMemo(() => [
    { id: 1, title: "Manche 1"},
    { id: 2, title: "Manche 2 Vainqueurs"},
    { id: 3, title: "Manche 2 Perdants"},
    { id: 4, title: "Manche 3 Doubles Vainqueurs"},
    { id: 5, title: "Manche 3 1 victoire 1 défaite"},
    { id: 6, title: "Manche 3 Doubles Perdants"},
    { id: 7, title: "Seizièmes de finale" },
    { id: 8, title: "Huitièmes de finale" },
    { id: 9, title: "Quarts de finale" },
    { id: 10, title: "Demi-finales" },
    { id: 11, title: "Finale" },
  ], []);

  // Fonctions de gestion du loader
  const startLoading = useCallback((message) => {
    setLoading(true);
    setLoaderMessage(message);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    setLoaderMessage('');
  }, []);

  // Gestion du KeyHandler
  useEffect(() => {
    // Désactiver le KeyHandler quand une modal est ouverte
    setKeyHandlerEnabled(!showInitModal && !showRegisterModal && !showUnregisterModal);
  }, [showInitModal, showRegisterModal, showUnregisterModal]);

  // Utilisation d'un effet unique pour les messages
  useEffect(() => {
    if (globalSuccessMessage) {
      const showMessage = async () => {
        await messageApi.open({
          type: 'success',
          content: globalSuccessMessage,
        });
        setGlobalSuccessMessage('');
      };
      showMessage();
    }
    
    if (globalErrorMessage) {
      const showError = async () => {
        await messageApi.open({
          type: 'error',
          content: globalErrorMessage,
        });
        setGlobalErrorMessage('');
      };
      showError();
    }
  }, [globalSuccessMessage, globalErrorMessage, messageApi]);

  const loadMatches = useCallback(async (panel) => {
    try {
      const [matchesData] = await Promise.all([
        getMatches(panel)
      ]);

      return matchesData;
    } catch (error) {
      setGlobalErrorMessage(`Erreur lors du chargement des matchs: ${error.message}`);
      return [];
    }
  }, []);

  const loadWaitingList = useCallback(async (panel) => {
    try {
      const teams = await getWaiting(panel);

      return teams;
    } catch (error) {
      setGlobalErrorMessage(`Erreur lors du chargement de la liste d'attente: ${error.message}`);
      return [];
    }
  }, []);

  const loadAllWaitingList = useCallback(async () => {
    try {
      const waitingTeams = {};
      panels.forEach(panel => {
        waitingTeams[panel.id] = [];
      });
      const allWaitingTeams = await loadWaitingList(-1);
      for (const team of allWaitingTeams) {
        for (const panel of panels) {
          const [stage, cat] = getStageAndCategorieByValue(panel.id);
          const stageProp = `stage${stage}`;
          const catProp = `cat_stage${stage}`;
                    
          if (team[stageProp] === 1 && team[catProp] === cat) {
            waitingTeams[panel.id].push(team.number);
          }
        }
      }
      setWaitingsTeams(waitingTeams);
    } catch (error) {
      setGlobalErrorMessage(`Erreur lors du chargement de la liste d'attente: ${error.message}`);
    }
  }, [setWaitingsTeams, panels, loadWaitingList]);

  const loadAllMatches = useCallback(async () => {
    try {
      const matches = {};
      panels.forEach(panel => {
        matches[panel.id] = [];
      });
      const allMatches = await loadMatches(-1);
      for (const match of allMatches) {
        matches[match.panel].push(match);
      }
      setMatches(matches);
    } catch (error) {
      setGlobalErrorMessage(`Erreur lors du chargement des matchs: ${error.message}`);
    }
  }, [setMatches, panels, loadMatches]);

  const loadTotalTeam = useCallback(async () => {
    try {
      const totalTeam = await getNumber();
      setTotalTeam(totalTeam);
    } catch (error) {
      setGlobalErrorMessage(`Erreur lors du chargement du nombre total d'équipes: ${error.message}`);
    }
  }, [setTotalTeam]);

  // Fonction pour charger toutes les données initiales
  const loadAllData = useCallback(async () => {
    startLoading('Chargement des données...');
    try {
      await loadAllWaitingList();
      await loadAllMatches();
      await loadTotalTeam();
    } catch (error) {
      setGlobalErrorMessage(`Erreur lors du chargement des données initiales: ${error.message}`);
    } finally {
      stopLoading();
    }
  }, [loadAllWaitingList, loadAllMatches, startLoading, stopLoading, loadTotalTeam]);

  // Chargement initial des données
  useEffect(() => {
    const loadInitialData = async () => {
      await loadAllData();
    };
    loadInitialData();
  }, [loadAllData]);

  const loadFirstPanelOnly = async () => {
    startLoading('Chargement des données du tableau 1...');
    try {
      const waitingTeams = await loadWaitingList(1);
      await loadTotalTeam();
      setWaitingsTeams({ ...waitingsTeams, 1: waitingTeams });
    } catch (error) {
      setGlobalErrorMessage(`Erreur lors du chargement des données initiales: ${error.message}`);
    } finally {
      stopLoading();
    }
  };

  // Gestionnaires de modales
  const handleInit = () => {
    setShowInitModal(true);
  };

  const handleRegister = () => {
    if (teamToRegister === '') {
      setGlobalErrorMessage('Veuillez entrer un nombre d\'equipes');
      return;
    }
    if (parseInt(teamToRegister) > 200) {
      setGlobalErrorMessage('Impossible d\'inscrire plus de 200 équipes');
      return;
    }
    setShowRegisterModal(true);
  };

  const handleUnregister = () => {
    if (unregisterTeamNumber === '' || !/^\d+$/.test(unregisterTeamNumber)) {
      setGlobalErrorMessage('Veuillez entrer un numéro d\'equipe');
      return;
    }
    setShowUnregisterModal(true);
  };

  const multiRegister = async () => {
    await register(teamToRegister);
    await loadFirstPanelOnly();
  }

  const registerOne = async () => {
    await register(1);
    await loadFirstPanelOnly();
  }

  const handleLeftArrow = () => {
    const leftArrowButton = document.querySelector('.left-arrow');
    if (leftArrowButton) {
      leftArrowButton.click();
    }
  };

  const handleRightArrow = () => {
    const rightArrowButton = document.querySelector('.right-arrow');
    if (rightArrowButton) {
      rightArrowButton.click();
    }
  };

  const handleSetWinner = async () => {
    if (validateWinnerTeam) {
      const match = Object.values(matches)
        .flat()
        .find(m => ([m.team1, m.team2].includes(parseInt(validateWinnerTeam))) && ([0, 1].includes(m.status)));
      if (!match) {
        setGlobalErrorMessage(`L'équipe ${validateWinnerTeam} n'est affectée à aucun match en cours`);
        return;
      }
      const status = await setWinner(match.id, parseInt(validateWinnerTeam));
      if (status === 200) {
        const radio = document.querySelector(`input[type="radio"][name="${match.id}"][value="${validateWinnerTeam}"]`);
        radio.checked = true;
        radio.click();
        setValidateWinnerTeam('');
      }
    } else {
      setGlobalErrorMessage('Veuillez sélectionner un vainqueur');
    }
  }

  return (
    <>
      {contextHolder}
      <div className="container">
        {keyHandlerEnabled && (
          <KeyHandler
            onLeftArrow={handleLeftArrow}
            onRightArrow={handleRightArrow}
            onEnter={handleSetWinner}
          />
        )}
        <ColumnSlider>
          <div className="column">
            <div className="title">Initialisation</div>
            <div className="buttons">
              <button className="init button-start green" onClick={handleInit}>
                Réinitialiser le tournoi
              </button>
              <div className="register-container">
                <input
                  id="team-count"
                  className="real-input"
                  placeholder="Nombre d'équipes"
                  value={teamToRegister}
                  autoComplete="off"
                  onChange={(e) => setTeamToRegister(e.target.value)}
                />
                <button className="register button-start" onClick={handleRegister}>
                  Ajouter des équipes
                </button>
              </div>
              <button className="register button-start" onClick={registerOne}>
                Ajouter une équipe
              </button>
              <div className="register-container">
                <input
                  id="team-unregister-number"
                  className="real-input"
                  placeholder="Numéro de triplette"
                  value={unregisterTeamNumber}
                  autoComplete="off"
                  onChange={(e) => setUnregisterTeamNumber(e.target.value)}
                />
                <button className="unregister button-start blue" onClick={handleUnregister}>
                  Désinscrire une équipe
                </button>
              </div>
            </div>
          </div>
          {Object.entries(matches)
            .filter(([panel]) => !(parseInt(panel) === 7 && totalTeam < 129))
            .map(([panel, panelMatches]) => (
            <Panel
              key={parseInt(panel)}
              panel={parseInt(panel)}
              panels={panels}
              panelMatches={panelMatches}
              loadMatches={loadMatches}
              waitingsTeams={waitingsTeams}
              setWaitingsTeams={setWaitingsTeams}
              loadWaitingList={loadWaitingList}
              loadAllData={loadAllData}
              validateWinnerTeam={validateWinnerTeam}
              validateLoserTeam={validateLoserTeam}
              handleSetWinner={handleSetWinner}
              setValidateWinnerTeam={setValidateWinnerTeam}
              setValidateLoserTeam={setValidateLoserTeam}
              setGlobalSuccessMessage={setGlobalSuccessMessage}
              setGlobalErrorMessage={setGlobalErrorMessage}
              matches={matches}
              setMatches={setMatches}
              setErrorMessage={setErrorMessage}
              setShowNotRegisterModal={setShowNotRegisterModal}
              loadAllWaitingList={loadAllWaitingList}
              startLoading={startLoading}
              stopLoading={stopLoading} 
            />
          ))}
        </ColumnSlider>

        {/* Modales */}
        <AntModal
          open={showInitModal}
          onCancel={() => setShowInitModal(false)}
          title="Réinitialisation"
          onOk={async () => {
            setShowInitModal(false);
            startLoading('Réinitialisation du tournoi...');
            await init();
            await loadAllData();
            setInitConfirm('');
            stopLoading();
          }}
          okText="Confirmer"
          cancelText="Annuler"
          okButtonProps={{ disabled: initConfirm !== 'CONFIRMER' }}
        >
          <p>Un concours est en cours, voulez-vous vraiment le réinitialiser ?</p>
          <p>Pour confirmer, entrez CONFIRMER</p>
          <input
            id="init-confirm"
            className="match-input"
            placeholder="CONFIRMER"
            value={initConfirm}
            autoComplete="off"
            onChange={(e) => setInitConfirm(e.target.value)}
          />
        </AntModal>

        <AntModal
          open={showRegisterModal}
          onCancel={() => setShowRegisterModal(false)}
          title="Inscription d'équipes"
          onOk={async () => {
            setShowRegisterModal(false);
            startLoading('Inscription des équipes...');
            await multiRegister();
            setTeamToRegister('');
            stopLoading();
          }}
          okText="Confirmer"
          cancelText="Annuler"
        >
          <p>Voulez-vous vraiment inscrire {teamToRegister} équipes ?</p>
        </AntModal>

        <AntModal
          open={showUnregisterModal}
          onCancel={() => setShowUnregisterModal(false)}
          title="Désinscription"
          onOk={async () => {
            setShowUnregisterModal(false);
            startLoading('Désinscription de l\'équipe...');
            const status = await unregister(unregisterTeamNumber);
            if (status === 200) {
              setGlobalSuccessMessage('L\'équipe a bien été désinscrite');
            } else {
              setGlobalErrorMessage('L\'équipe n\'a pas pu être désinscrite');
            }
            await loadFirstPanelOnly();
            setUnregisterTeamNumber('');
            stopLoading();
          }}
          okText="Confirmer"
          cancelText="Annuler"
        >
          <p>Voulez-vous vraiment désinscrire l'équipe numéro {unregisterTeamNumber} ?</p>
        </AntModal>

        <AntModal
          open={showNotRegisterModal}
          onCancel={() => setShowNotRegisterModal(false)}
          title="Résultat rejeté"
          footer={[ <Button key="close-button" onClick={() => setShowNotRegisterModal(false)}>Fermer</Button> ]}
        >
          <p> {errorMessage}</p>
        </AntModal>

        {/*Loader*/}
        {loading && <Loader message={loaderMessage}/>}

      </div>
    </>
  );
}

export default App;