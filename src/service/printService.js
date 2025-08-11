import { API_URL } from "./config.js";

const PRINT_API_URL = `${API_URL}/print`;

/**
 * Envoie une requête d'impression au backend
 * @param {number} round - Le numéro du round actuel
 * @param {Object} options - Les options d'impression
 * @param {string} options.scope - 'current' pour le round actuel, 'all' pour toute la manche
 * @param {string} options.matchStatus - 'all' pour tous les matchs, 'started' pour les matchs lancés uniquement
 * @returns {Promise<Blob>} - Le fichier PDF généré
 */
export async function generatePrint(round, { scope, matchStatus }) {
    try {
        const response = await fetch(`${PRINT_API_URL}/generate`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                round,
                scope,
                matchStatus
            })
        });

        if (response.status === 201){
            return 201
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la génération du PDF');
        }

        if (response.status === 201){
            return 201
        }
        return await response.blob();
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
    }
}

/**
 * Télécharge le fichier PDF généré
 * @param {Blob} blob - Le blob du fichier PDF
 * @param {string} filename - Le nom du fichier de sortie
 */
export function downloadPdf(blob, filename = 'feuille-de-marche.pdf') {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
