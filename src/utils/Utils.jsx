export const getRoundAndCategorieByValue = (value) => {
    switch (value) {
        case 1: return [1, 3];
        case 2: return [2, 3];
        case 3: return [2, 1];
        case 4: return [3, 3];
        case 5: return [3, 2];
        case 6: return [3, 1];
        case 7: return [4, 3];
        case 8: return [5, 3];  
        case 9: return [6, 3];
        case 10: return [7, 3];
        case 11: return [8, 3];
        default: return [0, 0];
    }        
}