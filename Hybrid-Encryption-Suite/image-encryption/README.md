# Image Encryption Tool

Secure image encryption using hybrid encryption (AES-256 + RSA-2048).

## Key Concept

**Images are just bytes.** The same encryption principles work for any file type.

```
Image File → Read as Bytes → AES Encryption → Encrypted Bytes ≠ Image (until decrypted)
```

## Features

- **AES-256-GCM** for fast, authenticated encryption of image data
- **RSA-2048** for secure AES key exchange
- **Hybrid encryption** combining symmetric and asymmetric cryptography
- JSON export for encrypted data storage

## How It Works

### Encryption
1. Read image file as raw bytes
2. Generate random 256-bit AES key
3. Generate random 96-bit nonce
4. Encrypt image bytes with AES-GCM
5. Encrypt AES key with RSA public key
6. Save: ciphertext, nonce, encrypted key

### Decryption
1. Decrypt AES key using RSA private key
2. Decrypt image bytes using AES key and nonce
3. Write decrypted bytes to file
4. Original image restored

## Usage

### Setup
```bash
pip install -r requirements.txt
```

### Run
```bash
python app.py
```

### Example Workflow

1. **Encrypt an image:**
   ```
   Choose: 1
   Enter image path: photo.jpg
   ```

2. **Save the three components** (ciphertext, nonce, encrypted key)

3. **Decrypt later:**
   ```
   Choose: 2
   Paste all three components
   Output filename: restored_photo.jpg
   ```

4. **Verify:** Open `restored_photo.jpg` - should match original perfectly

## Technical Details

- **Cipher:** AES-256-GCM (Galois/Counter Mode)
- **Key Exchange:** RSA-OAEP (2048-bit)
- **Hash:** SHA-256
- **Nonce:** Random 96-bits (12 bytes)
- **Authentication:** Built-in with GCM mode

## Why This Works

- **AES is fast** → Encrypts large files efficiently
- **RSA is slow** → Only encrypts small keys (256 bits)
- **Combined** → Fast encryption + secure key exchange
- **File agnostic** → Works with images, videos, documents, anything

## Real-World Applications

- Cloud storage encryption
- Secure file sharing
- Privacy-preserving backups
- Encrypted messaging attachments

## Learning Outcomes

✓ Files are treated as raw bytes  
✓ Same crypto applies to all data types  
✓ Hybrid encryption used in production systems  
✓ AES + RSA = practical security  

---

**Built with Python • Cryptography Library • Real-world Security Patterns**
