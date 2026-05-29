// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    selectedTab.classList.add('active');
    selectedTab.classList.remove('hidden');

    // Add active class to clicked button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Character counter
document.getElementById('plaintext').addEventListener('input', () => {
    const count = document.getElementById('plaintext').value.length;
    document.getElementById('char-count').textContent = count;
});

// Encrypt function
async function encryptText() {
    const plaintext = document.getElementById('plaintext').value.trim();

    if (!plaintext) {
        showNotification('Please enter text to encrypt', 'error');
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Encrypting...';

    try {
        const response = await fetch('/api/encrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: plaintext })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('result-ciphertext').value = data.ciphertext;
            document.getElementById('result-nonce').value = data.nonce;
            document.getElementById('result-encrypted-key').value = data.encrypted_key;
            
            const resultDiv = document.getElementById('encrypt-result');
            resultDiv.classList.remove('hidden');
            
            showNotification(`✓ Encrypted ${data.original_length} characters`, 'success');
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            showNotification(data.error || 'Encryption failed', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Encrypt';
    }
}

// Decrypt function
async function decryptText() {
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
            document.getElementById('result-plaintext').value = data.plaintext;
            
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
        btn.textContent = 'Decrypt';
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

// Download encrypted data as JSON
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
    link.download = `encrypted_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

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

console.log('✓ Encryption UI Ready');
