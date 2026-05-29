from flask import Flask, render_template, request, jsonify, send_from_directory, send_file
from crypto.aes_file_crypto import encrypt_image, decrypt_image
from crypto.rsa_crypto import generate_rsa_keys, encrypt_aes_key, decrypt_aes_key
import os
import json
import base64
from io import BytesIO

app = Flask(__name__)

# Set up paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.template_folder = BASE_DIR
app.static_folder = BASE_DIR
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save uploaded file
        temp_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(temp_path)
        
        # Encrypt
        aes_data = encrypt_image(temp_path)
        encrypted_aes_key = encrypt_aes_key(aes_data["key"], public_key)
        
        # Clean up
        os.remove(temp_path)
        
        return jsonify({
            "success": True,
            "ciphertext": aes_data["ciphertext"],
            "nonce": aes_data["nonce"],
            "encrypted_key": encrypted_aes_key,
            "filename": file.filename
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
        
        # Decrypt AES key
        aes_key = decrypt_aes_key(encrypted_key, private_key)
        
        # Prepare output path
        output_path = os.path.join(UPLOAD_FOLDER, 'decrypted_image')
        
        # Decrypt image
        decrypt_image(ciphertext, nonce, aes_key, output_path)
        
        # Read decrypted image
        with open(output_path, 'rb') as f:
            image_data = f.read()
        
        # Convert to base64 for display
        image_base64 = base64.b64encode(image_data).decode()
        
        # Clean up
        os.remove(output_path)
        
        return jsonify({
            "success": True,
            "image_data": image_base64,
            "image_base64": image_base64
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🖼️  Image Encryption Tool")
    print("Running on http://localhost:5001")
    app.run(debug=True, host='localhost', port=5001)
