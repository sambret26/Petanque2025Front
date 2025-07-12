import { API_URL } from "./config.js";

const MATCHES_API_URL = `${API_URL}/matches`;

// GET
export async function getMatches(panel) {
    try {
        const response = await fetch(`${MATCHES_API_URL}/getMatches/${panel}`);
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération des matchs du tableau ${panel}: ${response.status}`);
        }
        return await response?.json();
    } catch (error) {
        console.error(`Erreur lors de la récupération des matchs du tableau ${panel}: ${error}`);
        return [];
    }
}

//POST
export async function generate(panel) {
    try {
        const response = await fetch(`${MATCHES_API_URL}/generate/${panel}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors de la génération: ${response.status}`);
        }
        return response.status;
    } catch (error) {
        console.error(`Erreur lors de la génération: ${error}`);
    }
}

export async function ungenerate(panel) {
    try {
        const response = await fetch(`${MATCHES_API_URL}/ungenerate/${panel}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors de l'annulation de la génération: ${response.status}`);
        }
    } catch (error) {
        console.error(`Erreur lors de l'annulation de la génération: ${error}`);
    }
}

export async function launchMatches(panel) {
    try {
        const response = await fetch(`${MATCHES_API_URL}/launchMatches/${panel}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors du lancement des matchs: ${response.status}`);
        }
        return response.status;
    } catch (error) {
        console.error(`Erreur lors du lancement des matchs: ${error}`);
    }
}

export async function changeStatus(matchId) {
    try {
        const response = await fetch(`${MATCHES_API_URL}/changeStatus/${matchId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors du changement du statut du match: ${response.status}`);
        }
        return response.status;
    } catch (error) {
        console.error(`Erreur lors du changement du statut du match: ${error}`);
    }
}

export async function setWinner(matchId, teamNumber) {
    try {
        const response = await fetch(`${MATCHES_API_URL}/setWinner/${matchId}/${teamNumber}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`Erreur lors de la définition du vainqueur: ${response.status}`);
        }
        return response.status;
    } catch (error) {
        console.error(`Erreur lors de la définition du vainqueur: ${error}`);
    }
}

export async function createMatch(panel, teamNumber1, teamNumber2) {
    try {
        const response = await fetch(`${MATCHES_API_URL}/createMatch/${panel}/${teamNumber1}/${teamNumber2}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors de la création du match: ${response.status}`);
        }
        const data = await response.json();
        return { match: data.match, status: response.status };
    } catch (error) {
        console.error(`Erreur lors de la création du match: ${error}`);
    }
}

export async function deleteMatch(matchId) {
    try {
        const response = await fetch(`${MATCHES_API_URL}/deleteMatch/${matchId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors de la suppression du match: ${response.status}`);
        }
        return response.status;
    } catch (error) {
        console.error(`Erreur lors de la suppression du match: ${error}`);
    }
}