from flask import Flask, render_template, request, jsonify, session
import random
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

@app.route('/')
def index():
    """Serve the main game page"""
    return render_template('index.html')

@app.route('/start_game', methods=['POST'])
def start_game():
    """Initialize a new game"""
    # Generate a random number between 1 and 100
    secret_number = random.randint(1, 100)
    session['secret_number'] = secret_number
    session['guesses'] = 0
    return jsonify({
        'status': 'success',
        'message': 'Game started! Guess a number between 1 and 100.',
        'guesses': 0
    })

@app.route('/guess', methods=['POST'])
def guess():
    """Handle a guess from the user"""
    data = request.json
    user_guess = data.get('guess')
    
    # Validate input
    try:
        user_guess = int(user_guess)
    except (ValueError, TypeError):
        return jsonify({
            'status': 'error',
            'message': 'Please enter a valid number!'
        }), 400
    
    # Check if game is initialized
    if 'secret_number' not in session:
        return jsonify({
            'status': 'error',
            'message': 'Please start a new game first!'
        }), 400
    
    secret_number = session['secret_number']
    session['guesses'] = session.get('guesses', 0) + 1
    guesses = session['guesses']
    
    # Check the guess
    if user_guess == secret_number:
        # Correct guess!
        return jsonify({
            'status': 'success',
            'correct': True,
            'message': f'Congratulations! You guessed the number {secret_number} correctly in {guesses} attempts!',
            'guesses': guesses,
            'secret_number': secret_number
        })
    elif user_guess > secret_number:
        return jsonify({
            'status': 'success',
            'correct': False,
            'message': 'Lower number please',
            'guesses': guesses
        })
    else:  # user_guess < secret_number
        return jsonify({
            'status': 'success',
            'correct': False,
            'message': 'Higher number please',
            'guesses': guesses
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

