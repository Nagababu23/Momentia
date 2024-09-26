from flask import Flask, request, jsonify
from flask_cors import CORS  
import numpy as np
import emoji
import pickle  

# Load your trained model and other components
with open('best_xgb_model.pkl', 'rb') as model_file:
    best_xgb = pickle.load(model_file)

with open('vectorizer.pkl', 'rb') as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

with open('label_encoder.pkl', 'rb') as encoder_file:
    label_encoder_y = pickle.load(encoder_file)

# Function to extract emojis from text
def extract_emojis(text):
    return [char for char in text if char in emoji.EMOJI_DATA]

# Flask API Setup
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json  
        print("Received data:", data)  # Debugging line
        emoji_sequence = data.get('emoji_sequence', '')

        if not emoji_sequence:
            return jsonify({'error': 'No emoji sequence provided'}), 400

        # Implement prediction logic
        predicted_target = predict_emoji_sequence(emoji_sequence)

        # Convert predicted_target to standard Python int before returning
        return jsonify({'predicted_target': int(predicted_target)})
    except Exception as e:
        print("Error occurred:", e)  # Debugging line
        return jsonify({'error': str(e)}), 500

def predict_emoji_sequence(emoji_sequence):
    # Extract emojis from the input sequence
    emojis = extract_emojis(emoji_sequence)
    emoji_str = ''.join(emojis)
    
    # Transform the emoji sequence into the TF-IDF format
    emoji_vector = vectorizer.transform([emoji_str])
    
    # Predict using the best model
    prediction = best_xgb.predict(emoji_vector)

    # Convert prediction to a standard type
    predicted_class = int(prediction[0])  # Ensure it's a standard int

    # Decode the target back to its original label
    return label_encoder_y.inverse_transform([predicted_class])[0]  # Ensure return value is compatible

if __name__ == '__main__':
    app.run(debug=True)
