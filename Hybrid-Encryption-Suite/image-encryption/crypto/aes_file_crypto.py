from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import base64

def encrypt_image(file_path):
    """
    Encrypt an image file using AES-256-GCM
    
    Args:
        file_path: Path to the image file
        
    Returns:
        Dictionary with base64-encoded ciphertext, nonce, and key
    """
    with open(file_path, "rb") as f:
        data = f.read()

    key = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)

    ciphertext = aesgcm.encrypt(nonce, data, None)

    return {
        "ciphertext": base64.b64encode(ciphertext).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "key": base64.b64encode(key).decode()
    }

def decrypt_image(ciphertext_b64, nonce_b64, key_b64, output_file):
    """
    Decrypt an encrypted image file
    
    Args:
        ciphertext_b64: Base64-encoded ciphertext
        nonce_b64: Base64-encoded nonce
        key_b64: Base64-encoded AES key
        output_file: Path to save the decrypted image
    """
    ciphertext = base64.b64decode(ciphertext_b64)
    nonce = base64.b64decode(nonce_b64)
    key = base64.b64decode(key_b64)

    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)

    with open(output_file, "wb") as f:
        f.write(plaintext)
