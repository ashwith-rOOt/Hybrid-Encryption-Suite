// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const selectedTab = document.getElementById(tabName);
    selectedTab.classList.add('active');
    selectedTab.classList.remove('hidden');

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Preview image
function previewImage() {
    const file = document.getElementById('image-file').files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('preview-img');
        const info = document.getElementById('file-info');
        
        img.src = e.target.result;
        info.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Remove image
function removeImage() {
    document.getElementById('image-file').value = '';
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('encrypt-result').classList.add('hidden');
}

// Encrypt image
async function encryptImage() {
    const file = document.getElementById('image-file').files[0];
    if (!file) {
        showNotification('Please select an image', 'error');
        return;
    }

    const btn = document.getElementById('encrypt-btn');
    btn.disabled = true;
    btn.textContent = 'Encrypting...';

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/encrypt', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('result-ciphertext').value = data.ciphertext;
            document.getElementById('result-nonce').value = data.nonce;
            document.getElementById('result-encrypted-key').value = data.encrypted_key;
            
            const resultDiv = document.getElementById('encrypt-result');
            resultDiv.classList.remove('hidden');
            
            showNotification(`✓ Encrypted ${file.name}`, 'success');
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            showNotification(data.error || 'Encryption failed', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Encrypt Image';
    }
}

// Decrypt image
async function decryptImage() {
    const ciphertext = document.getElementById('decrypt-ciphertext').value.trim();
    const nonce = document.getElementById('decrypt-nonce').value.trim();
    const encrypted_key = document.getElementById('decrypt-key').value.trim();

    if (!ciphertext || !nonce || !encrypted_key) {
        showNotification('Please provide all three components', 'error');
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Decrypting...';

    try {
        const response = await fetch('/api/decrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ciphertext: ciphertext,
                nonce: nonce,
                encrypted_key: encrypted_key
            })
        });

        const data = await response.json();

        if (data.success) {
            const img = document.getElementById('decrypted-img');
            img.src = `data:image/png;base64,${data.image_base64}`;
            
            // Store base64 for download
            img.dataset.base64 = data.image_base64;
            
            const resultDiv = document.getElementById('decrypt-result');
            resultDiv.classList.remove('hidden');
            
            showNotification('✓ Decrypted successfully', 'success');
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            showNotification(data.error || 'Decryption failed', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Decrypt Image';
    }
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');

    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

// Download encrypted data
function downloadEncrypted() {
    const data = {
        ciphertext: document.getElementById('result-ciphertext').value,
        nonce: document.getElementById('result-nonce').value,
        encrypted_key: document.getElementById('result-encrypted-key').value,
        encrypted_at: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `encrypted_image_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('✓ Downloaded', 'success');
}

// Download decrypted image
function downloadDecrypted() {
    const img = document.getElementById('decrypted-img');
    const base64 = img.dataset.base64;
    
    if (!base64) {
        showNotification('No image to download', 'error');
        return;
    }

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `decrypted_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('✓ Downloaded', 'success');
}

// Show notifications
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

console.log('✓ Image Encryption UI Ready');
