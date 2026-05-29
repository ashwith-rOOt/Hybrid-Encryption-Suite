from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
from crypto.aes_crypto import encrypt_text, decrypt_text
from crypto.rsa_crypto import generate_rsa_keys, encrypt_aes_key, decrypt_aes_key
import json
import os

app = Flask(__name__)

# Set up paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.template_folder = BASE_DIR
app.static_folder = BASE_DIR

# Generate RSA keys once at startup
private_key, public_key = generate_rsa_keys()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(BASE_DIR, filename)

@app.route('/api/encrypt', methods=['POST'])
def api_encrypt():
    try:
        data = request.json
        plaintext = data.get('text', '')
        
        if not plaintext:
            return jsonify({"error": "No text provided"}), 400
        
        # AES encryption
        aes_data = encrypt_text(plaintext)
        
        # RSA encryption of AES key
        encrypted_aes_key = encrypt_aes_key(aes_data["key"], public_key)
        
        return jsonify({
            "success": True,
            "ciphertext": aes_data["ciphertext"],
            "nonce": aes_data["nonce"],
            "encrypted_key": encrypted_aes_key,
            "original_length": len(plaintext)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/decrypt', methods=['POST'])
def api_decrypt():
    try:
        data = request.json
        ciphertext = data.get('ciphertext', '')
        nonce = data.get('nonce', '')
        encrypted_key = data.get('encrypted_key', '')
        
        if not all([ciphertext, nonce, encrypted_key]):
            return jsonify({"error": "Missing encryption data"}), 400
        
        # RSA decryption of AES key
        aes_key = decrypt_aes_key(encrypted_key, private_key)
        
        # AES decryption
        plaintext = decrypt_text(aes_key, nonce, ciphertext)
        
        return jsonify({
            "success": True,
            "plaintext": plaintext
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🔐 Secure Text Encryption Tool")
    print("Running on http://localhost:5000")
    app.run(debug=True, host='localhost', port=5000)
