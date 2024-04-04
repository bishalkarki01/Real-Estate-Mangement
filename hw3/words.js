const fs = require('fs');

// Function to read words from a file
function readWordsFromFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data.split(/\s+/); 
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }

}
// File path
const filePath = 'words.txt';
// Read words from file
const words = readWordsFromFile(filePath);
module.exports = {
    words
};


