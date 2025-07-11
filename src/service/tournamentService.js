import { API_URL } from "./config.js";

const TOURNAMENT_API_URL = `${API_URL}/tournament`;

//POST
export async function init() {
    try {
        const response = await fetch(`${TOURNAMENT_API_URL}/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erreur lors de l'initialisation: ${response.status}`);
        }
    } catch (error) {
        console.error(`Erreur lors de l'initialisation: ${error}`);
    }
}