import { API_URL } from "./config.js";

const TEAMS_API_URL = `${API_URL}/teams`;

// GET
export async function getNumber() {
    try {
        const response = await fetch(`${TEAMS_API_URL}/getNumber`);
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération du nombre d'equipes: ${response.status}`);
        }
        return await response.json() 
    } catch (error) {
        console.error(`Erreur lors de la récupération du nombre d'equipes: ${error}`);
        return 0;
    }
}

export async function getWaiting(panel) {
    try {
        const response = await fetch(`${TEAMS_API_URL}/getWaiting/${panel}`);
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de la liste d'attente du tableau ${panel}: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erreur lors de la récupération de la liste d'attente du tableau ${panel}: ${error}`);
        return [];
    }
}

// POST
export async function register(teamNumber) {
    try {
        const response = await fetch(`${TEAMS_API_URL}/register/${teamNumber}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors de l'inscription de l'équipe: ${response.status}`);
        }
    } catch (error) {
        console.error(`Erreur lors de l'inscription de l'équipe: ${error}`);
    }
}

export async function unregister(teamNumber) {
    try {
        const response = await fetch(`${TEAMS_API_URL}/unregister/${teamNumber}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors de la désinscription de l'équipe: ${response.status}`);
        }
        return parseInt(response.status);
    } catch (error) {
        console.error(`Erreur lors de la désinscription de l'équipe: ${error}`);
    }
}

export async function luckyLoser(panel, team) {
    try {
        const response = await fetch(`${TEAMS_API_URL}/luckyLoser/${panel}/${team}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors de la désinscription de l'équipe: ${response.status}`);
        }
        return parseInt(response.status);
    } catch (error) {
        console.error(`Erreur lors de la désinscription de l'équipe: ${error}`);
    }
}