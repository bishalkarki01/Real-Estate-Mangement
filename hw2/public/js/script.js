
let metaData;
let word;
let sid1;
let id;

document.addEventListener('DOMContentLoaded', function() {
    // Fetch the list of fonts from the server
    const fontSelect = document.getElementById('fontSelect');
    const googleFontsApiKey = 'AIzaSyD1W4xWIryq-DRfEaFcRi24tCSp4v7zy94'; // Replace with your actual Google Fonts API key
    const googleFontsApiUrl = `https://www.googleapis.com/webfonts/v1/webfonts?key=${googleFontsApiKey}`;

    // Fetch custom fonts from your server
    fetch('/api/v1/meta/fonts')
    .then(response => response.json())
    .then(customFonts => {
        customFonts.forEach(font => {
            let option = new Option(font, font);
            fontSelect.add(option);
        });

        // Fetch Google Fonts
        return fetch(googleFontsApiUrl);
    })
    .then(response => response.json())
    .then(data => {
        const googleFonts = data.items.slice(0, 10); 
        googleFonts.forEach(font => {
            let option = new Option(font.family, font.family);
            fontSelect.add(option);
        });
    })
    .catch(error => {
        console.error('Error fetching fonts:', error);
    });

    // Function to populate the select element
    function populateSelectElement(fonts) {
        const selectElement = document.getElementById('fontSelector');
        fonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            selectElement.appendChild(option);
        });
    }

    // Load default views
    fetch('/api/v1/meta')
        .then(response => response.json())
        .then(data => {
            metaData = data;
            console.log('Metadata:', metaData);
            const levelSelect = document.getElementById('levelSelect');
            data.levels.forEach(level => {
                let option = new Option(level.name, level.name);
                levelSelect.add(option);
                levelSelect.value = data.defaults.level.name;
            });
            const wordBackground = document.getElementById('wordBackground');
            const guessBackground = document.getElementById('guessBackground');
            const textBackground = document.getElementById('textBackground');
            if (Array.isArray(data.defaults.colors)) {
                data.defaults.colors.forEach(colorObj => {
                    if (colorObj.wordBackground) {
                        wordBackground.value = colorObj.wordBackground;
                    }
                    if (colorObj.textBackground) {
                        textBackground.value = colorObj.textBackground;
                    }
                    if (colorObj.guessBackground) {
                        guessBackground.value = colorObj.guessBackground;
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching meta data:', error));

    // Button onClick
    const guessesLeftSpan = document.getElementById('guessesLeft');
    document.getElementById('new-game').addEventListener('click', function() {
        document.getElementById('targetDiv').innerHTML = '';
        document.getElementById('guessDiv').innerHTML = '';
        document.getElementById('guessesLeft').innerHTML = '';
        const gameViewDiv = document.getElementById('game-view');
        const levelSelect = document.getElementById('levelSelect');
        const selectedValue = levelSelect.value;
        const sid = localStorage.getItem('sid');
        const fonts = document.getElementById('fontSelect').value;
        const wordBackground = document.getElementById('wordBackground').value;
        const textBackground = document.getElementById('textBackground').value;
        const guessBackground = document.getElementById('guessBackground').value;
        const colors = { wordBackground, textBackground, guessBackground };
        fetch(`/api/v1/${sid}/games?level=${selectedValue}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-font': fonts
            },
            body: JSON.stringify({ colors })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            function appendLetterBox() {
                guessesLeftSpan.textContent = data.remaining;
                const colorPicker = document.getElementById('wordBackground');
                const newDiv = document.createElement('div');
                newDiv.classList.add('letter-box');
                document.getElementById('targetDiv').appendChild(newDiv);
                newDiv.style.backgroundColor = colorPicker.value;
            }
            const numberOfBoxes = data.target.length;
            word = data.target;
            id = data.id;
            sid1 = sid;
            document.getElementById('targetDiv').innerHTML = '';
            for (let i = 0; i < numberOfBoxes; i++) {
                appendLetterBox();
            }
            console.log('Game created:', data);
        })
        .catch(error => {
            console.error('Error creating game:', error);
        });
    });

    // Get SID
    fetch('/api/v1/sid')
        .then(response => {
            const sidFromHeader = response.headers.get('X-sid');
            console.log('SID from header:', sidFromHeader);
            return response.json();
        })
        .then(data => {
            localStorage.setItem('sid', data.sid);
        })
        .catch(error => {
            console.error('Error fetching SID:', error);
        });

    // For remaining guess
    const guessInput = document.getElementById('guessbox');
    const gameOutcomeGifContainer = document.getElementById('game-view');
    document.getElementById('guessButton').addEventListener('click', function() {
        gameOutcomeGifContainer.style.backgroundImage = '';
        function postGuess(sid, id, guess) {
            const url = `/api/v1/${sid}/games/${id}/guesses?guess=${guess}`;

            fetch(url, { method: 'POST' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    guessesLeftSpan.textContent = data.remaining;
                    guessInput.value = '';
                    function appendLetterBox(ch) {
                        localStorage.setItem('target', data.target);
                        localStorage.setItem('remaining', data.remaining.toString());
                        const colorPicker = document.getElementById('wordBackground');
                        const newDiv = document.createElement('div');
                        newDiv.textContent = ch;
                        newDiv.style.color = data.colors.textBackground;
                        newDiv.style.fontFamily = data.font;
                        newDiv.classList.add('letter-box');
                        document.getElementById('targetDiv').appendChild(newDiv);
                        newDiv.style.backgroundColor = colorPicker.value;
                    }
                    const totalnoDiv = data.view.length;
                    document.getElementById('targetDiv').innerHTML = '';
                    for (let i = 0; i < totalnoDiv; i++) {
                        appendLetterBox(data.view[i]);
                    }

                    function appendLetterBox1(bs) {
                        localStorage.setItem('target', data.target);
                        localStorage.setItem('remaining', data.remaining.toString());
                        const colorPicker1 = document.getElementById('guessBackground');
                        const newDiv = document.createElement('div');
                        newDiv.textContent = bs;
                        newDiv.classList.add('guess-letterbox');
                        document.getElementById('guessDiv').appendChild(newDiv);
                        newDiv.style.color = data.colors.textBackground;
                        newDiv.style.fontFamily = data.font;
                        newDiv.style.backgroundColor = colorPicker1.value;
                    }
                    const numberOfBoxes = data.guesses.length;
                    document.getElementById('guessDiv').innerHTML = '';
                    for (let i = 0; i < numberOfBoxes; i++) {
                        appendLetterBox1(data.guesses[i]);
                    }

                    if (data.status === 'victory') {
                        gameOutcomeGifContainer.style.backgroundImage = "url('./img/winner.gif')";
                        gameOutcomeGifContainer.style.display = 'block'; // Show the container
                    } else if (data.status === 'loss') {
                        gameOutcomeGifContainer.style.backgroundImage = "url('./img/cry.gif')";
                        gameOutcomeGifContainer.style.display = 'block'; // Show the container
                    }
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
        postGuess(sid1, id, guessInput.value);
    });

    // For table load
    document.getElementById('fetchGameButton').addEventListener('click', function() {
        function fetchGameData(sid) {
            const url = `/api/v1/${sid}/games`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Games not found or other network error');
                    }
                    return response.json();
                })
                .then(games => {
                    const tableBody = document.querySelector('#gameTable tbody');

                    while (tableBody.firstChild) {
                        tableBody.removeChild(tableBody.firstChild);
                    }
                    games.forEach(game => {
                        const row = tableBody.insertRow();
                        
                        row.setAttribute('data-game-id', game.id);

                        const level = row.insertCell(0);
                        level.textContent = game.level;
                        level.style.cursor = "pointer";

                        const viewCell = row.insertCell(1);
                        viewCell.innerHTML = '';

                        if (typeof game.view === 'string' || Array.isArray(game.view)) {
                            for (let ch of game.view) {
                                const newDiv = document.createElement('div');
                                newDiv.textContent = ch;
                                newDiv.style.display = 'inline-block';
                                newDiv.style.color = game.colors.textBackground;
                                newDiv.style.backgroundColor = game.colors.wordBackground;
                                newDiv.style.fontFamily = game.font;
                                newDiv.classList.add('letter-box');
                                newDiv.style.height = '50px';
                                newDiv.style.width = '40px';

                                viewCell.appendChild(newDiv);
                            }
                        } else {
                            viewCell.textContent = 'N/A'; // Example default text
                        }
    
                        const remaining = row.insertCell(2);
                        remaining.textContent = game.remaining;
        
                        const target = row.insertCell(3);
                        target.textContent = game.status.toLowerCase() !== 'unfinished' ? game.target : "";

                        const status = row.insertCell(4);
                        status.textContent = game.status;

                        level.addEventListener('click', function() {
                            id= game.id;
                            fetchGameDetails(sid,game.id);
                        });
                    });
                    console.log(games);
                })
                .catch(error => {
                    console.error('Error fetching game data:', error);
                    alert('Game data could not be fetched. See console for details.');
                });
        }
        fetchGameData(sid1, id);
    });
});

function fetchGameDetails(sid, id) {
    fetch(`/api/v1/${sid}/games/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Game details not found or other network error');
            }
            return response.json();
        })
        .then(data => {

            const gameDetailsContainer = document.getElementById('game-view');
            gameDetailsContainer.style.backgroundImage = '';
            if (data.status === 'victory') {
                gameDetailsContainer.style.backgroundImage = "url('./img/winner.gif')";
                gameDetailsContainer.style.display = 'block'; // Show the container
            } else if (data.status === 'loss') {
                gameDetailsContainer.style.backgroundImage = "url('./img/cry.gif')";
                gameDetailsContainer.style.display = 'block'; // Show the container
            } else if (data.status === 'unfinished') {
                gameDetailsContainer.style.backgroundImage = 'none';
                gameDetailsContainer.style.display = 'block'; // No background image
             // Optionally hide the container if unfinished
            }

            // Show the modal
            const gameDetailsModal = new bootstrap.Modal(document.getElementById('NewgameModal'));
            gameDetailsModal.show();
            function appendLetterBox(ch) {
                localStorage.setItem('target', data.target);
                localStorage.setItem('remaining', data.remaining.toString());
                const colorPicker = document.getElementById('wordBackground');
                const newDiv = document.createElement('div');
                newDiv.textContent = ch;
                newDiv.style.color = data.colors.textBackground;
                newDiv.style.fontFamily = data.font;
                newDiv.classList.add('letter-box');
                document.getElementById('targetDiv').appendChild(newDiv);
                newDiv.style.backgroundColor = colorPicker.value;
            }
            const totalnoDiv = data.view.length;
            document.getElementById('targetDiv').innerHTML = '';
            for (let i = 0; i < totalnoDiv; i++) {
                appendLetterBox(data.view[i]);
            }

            function appendLetterBox1(bs) {
                localStorage.setItem('target', data.target);
                localStorage.setItem('remaining', data.remaining.toString());
                const colorPicker1 = document.getElementById('guessBackground');
                const newDiv = document.createElement('div');
                newDiv.textContent = bs;
                newDiv.classList.add('guess-letterbox');
                document.getElementById('guessDiv').appendChild(newDiv);
                newDiv.style.color = data.colors.textBackground;
                newDiv.style.fontFamily = data.font;
                newDiv.style.backgroundColor = colorPicker1.value;
            }
            const numberOfBoxes = data.guesses.length;
            document.getElementById('guessDiv').innerHTML = '';
            for (let i = 0; i < numberOfBoxes; i++) {
                appendLetterBox1(data.guesses[i]);
            }
            
        })
        .catch(error => {
            console.error('Error fetching game details:', error);
            alert('Game details could not be fetched.');
        });
}


