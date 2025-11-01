let gameActive = false;
let gameHistory = [];

// DOM elements
const startBtn = document.getElementById('startBtn');
const guessBtn = document.getElementById('guessBtn');
const guessInput = document.getElementById('guessInput');
const messageDiv = document.getElementById('message');
const attemptsDiv = document.getElementById('attempts');
const statusDiv = document.getElementById('status');
const historyDiv = document.getElementById('history');

// Event listeners
startBtn.addEventListener('click', startGame);
guessBtn.addEventListener('click', makeGuess);
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !guessBtn.disabled) {
        makeGuess();
    }
});

// Start a new game
async function startGame() {
    try {
        const response = await fetch('/start_game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            gameActive = true;
            gameHistory = [];
            guessInput.disabled = false;
            guessBtn.disabled = false;
            guessInput.value = '';
            guessInput.focus();
            
            updateMessage(data.message, 'info');
            updateAttempts(0);
            updateStatus('Playing');
            clearHistory();
            
            startBtn.textContent = 'Restart Game';
        }
    } catch (error) {
        updateMessage('Error starting game. Please try again.', 'error');
        console.error('Error:', error);
    }
}

// Make a guess
async function makeGuess() {
    const guess = parseInt(guessInput.value);
    
    // Validate input
    if (isNaN(guess) || guess < 1 || guess > 100) {
        updateMessage('Please enter a valid number between 1 and 100!', 'error');
        guessInput.value = '';
        guessInput.focus();
        return;
    }
    
    try {
        const response = await fetch('/guess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ guess: guess })
        });
        
        const data = await response.json();
        
        if (data.status === 'error') {
            updateMessage(data.message, 'error');
            return;
        }
        
        // Update attempts
        updateAttempts(data.guesses);
        
        // Add to history
        addToHistory(guess, data.message, data.correct);
        
        if (data.correct) {
            // Game won!
            gameActive = false;
            guessInput.disabled = true;
            guessBtn.disabled = true;
            updateMessage(data.message, 'success');
            updateStatus('Won!');
            startBtn.textContent = 'Play Again';
        } else {
            // Provide hint
            updateMessage(data.message, 'warning');
            updateStatus('Playing');
        }
        
        guessInput.value = '';
        guessInput.focus();
        
    } catch (error) {
        updateMessage('Error making guess. Please try again.', 'error');
        console.error('Error:', error);
    }
}

// Update message display
function updateMessage(text, type = 'info') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
}

// Update attempts counter
function updateAttempts(count) {
    attemptsDiv.textContent = count;
}

// Update status
function updateStatus(status) {
    statusDiv.textContent = status;
}

// Add guess to history
function addToHistory(guess, hint, isCorrect) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    if (isCorrect) {
        historyItem.classList.add('correct');
    } else if (hint.includes('Lower')) {
        historyItem.classList.add('lower');
    } else {
        historyItem.classList.add('higher');
    }
    
    historyItem.innerHTML = `
        <span class="history-guess">Guess: ${guess}</span>
        <span class="history-hint">${hint}</span>
    `;
    
    historyDiv.insertBefore(historyItem, historyDiv.firstChild);
}

// Clear history
function clearHistory() {
    historyDiv.innerHTML = '';
}

