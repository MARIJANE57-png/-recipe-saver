// Image Scan JavaScript - Recipe Society

const API_URL = 'https://recipe-api-pqbr.onrender.com';

// Generate a simple user ID (you can make this more sophisticated later)
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now();
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Setup image upload
function setupImageScan() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('imageFileInput');
    const scanButton = document.getElementById('scanImageButton');
    const statusMessage = document.getElementById('statusMessage');

    if (!uploadArea || !fileInput || !scanButton) {
        console.error('Image scan elements not found');
        return;
    }

    // Click upload area to select file
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    // File selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Scan button clicked
    scanButton.addEventListener('click', async () => {
        if (fileInput.files.length === 0) {
            showMessage('Please select an image first', 'error');
            return;
        }

        await scanRecipeImage(fileInput.files[0]);
    });
}

// Handle file selection
function handleFileSelect(file) {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(2) + ' KB';

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadArea.innerHTML = `
            <img src="${e.target.result}" alt="Preview" class="image-preview" style="max-width: 100%; max-height: 300px; border-radius: 12px;">
            <p style="margin-top: 12px; font-size: 14px; color: var(--color-warm-gray);">
                ${fileName} (${fileSize})
            </p>
            <p style="font-size: 13px; color: var(--color-sage); margin-top: 4px;">
                ✓ Ready to scan
            </p>
        `;
    };
    reader.readAsDataURL(file);
}

// Scan recipe from image
async function scanRecipeImage(file) {
    const scanButton = document.getElementById('scanImageButton');
    const originalText = scanButton.textContent;
    
    try {
        // Show loading state
        scanButton.textContent = 'Scanning...';
        scanButton.disabled = true;
        showMessage('Reading recipe from image...', 'loading');

        // Convert image to base64
        const base64Image = await fileToBase64(file);

        // Call API
        const response = await fetch(`${API_URL}/image/extract`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageData: base64Image,
                userId: getUserId()
            })
        });

        const data = await response.json();

        if (data.success && data.recipe) {
            // Remove large base64 image before saving to localStorage
            const recipeToSave = { ...data.recipe };
            if (recipeToSave.thumbnailUrl && recipeToSave.thumbnailUrl.startsWith('data:image')) {
                // Don't store large base64 images in localStorage
                recipeToSave.thumbnailUrl = '';
            }
            
            // Save to localStorage
            const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
            recipes.push(recipeToSave);
            localStorage.setItem('recipes', JSON.stringify(recipes));

            showMessage('Recipe scanned successfully! Redirecting...', 'success');
            
            // Redirect to recipe book after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'recipe-book.html';
            }, 1500);
        } else {
            showMessage(data.error || 'Failed to scan recipe', 'error');
        }

    } catch (error) {
        console.error('Scan error:', error);
        showMessage('Error scanning recipe: ' + error.message, 'error');
    } finally {
        scanButton.textContent = originalText;
        scanButton.disabled = false;
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Show status message
function showMessage(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type + ' show';

    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusMessage.classList.remove('show');
        }, 5000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupImageScan();
});
