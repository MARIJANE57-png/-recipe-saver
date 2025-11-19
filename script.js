// Recipe Society - Import JavaScript

const API_URL = 'https://recipe-api-pqbr.onrender.com';

// Generate/get consistent user ID
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now();
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Tab Switching for Horizontal Pills
const tabPills = document.querySelectorAll('.tab-pill');
const tabContents = document.querySelectorAll('.tab-content');

tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
        const platform = pill.dataset.platform;
        
        // Update active pill
        tabPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        
        // Show corresponding content
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${platform}-tab`).classList.add('active');
    });
});

// TikTok Extraction
document.getElementById('extractTiktokBtn')?.addEventListener('click', async () => {
    const url = document.getElementById('tiktokUrl').value.trim();
    const statusEl = document.getElementById('tiktokStatus');
    const btn = document.getElementById('extractTiktokBtn');
    
    if (!url) {
        showStatus(statusEl, 'Please enter a TikTok URL', 'error');
        return;
    }
    
    // Validate URL format
    if (!url.includes('tiktok.com')) {
        showStatus(statusEl, 'Please enter a valid TikTok URL', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Extracting...';
    
    try {
        await extractRecipe('tiktok/auto-extract', { 
            tiktokUrl: url, 
            userId: getUserId() 
        }, statusEl);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Extract Recipe';
    }
});

// Instagram Extraction
document.getElementById('extractInstagramBtn')?.addEventListener('click', async () => {
    const url = document.getElementById('instagramUrl').value.trim();
    const statusEl = document.getElementById('instagramStatus');
    const btn = document.getElementById('extractInstagramBtn');
    
    if (!url) {
        showStatus(statusEl, 'Please enter an Instagram URL', 'error');
        return;
    }
    
    // Validate URL format
    if (!url.includes('instagram.com')) {
        showStatus(statusEl, 'Please enter a valid Instagram URL', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Extracting...';
    
    try {
        await extractRecipe('instagram/auto-extract', { 
            instagramUrl: url, 
            userId: getUserId() 
        }, statusEl);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Extract Recipe';
    }
});

// Image Upload & Scan
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const extractImageBtn = document.getElementById('extractImageBtn');

uploadArea?.addEventListener('click', () => imageInput.click());

uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea?.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

imageInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        document.querySelector('.upload-placeholder').style.display = 'none';
        extractImageBtn.style.display = 'block';
        extractImageBtn.dataset.imageData = e.target.result;
    };
    reader.readAsDataURL(file);
}

extractImageBtn?.addEventListener('click', async () => {
    const imageData = extractImageBtn.dataset.imageData;
    const statusEl = document.getElementById('scanStatus');
    
    if (!imageData) {
        showStatus(statusEl, 'Please upload an image first', 'error');
        return;
    }
    
    extractImageBtn.disabled = true;
    extractImageBtn.textContent = 'Extracting...';
    
    try {
        await extractRecipe('image/extract', { 
            imageData, 
            userId: getUserId() 
        }, statusEl);
    } finally {
        extractImageBtn.disabled = false;
        extractImageBtn.textContent = 'Extract Recipe from Image';
    }
});

// Website URL Extraction
document.getElementById('extractUrlBtn')?.addEventListener('click', async () => {
    const url = document.getElementById('websiteUrl').value.trim();
    const statusEl = document.getElementById('urlStatus');
    const btn = document.getElementById('extractUrlBtn');
    
    if (!url) {
        showStatus(statusEl, 'Please enter a website URL', 'error');
        return;
    }
    
    // Basic URL validation
    try {
        new URL(url);
    } catch (e) {
        showStatus(statusEl, 'Please enter a valid URL (include https://)', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Extracting...';
    
    try {
        await extractRecipe('website/extract', { 
            websiteUrl: url, 
            userId: getUserId() 
        }, statusEl);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Extract Recipe';
    }
});

// Manual Recipe Form
document.getElementById('manualForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('manualStatus');
    
    const recipe = {
        title: document.getElementById('manualTitle').value.trim(),
        description: document.getElementById('manualDescription').value.trim(),
        prepTime: document.getElementById('manualPrepTime').value.trim(),
        cookTime: document.getElementById('manualCookTime').value.trim(),
        servings: document.getElementById('manualServings').value.trim(),
        ingredients: document.getElementById('manualIngredients').value
            .split('\n')
            .map(i => i.trim())
            .filter(i => i.length > 0),
        instructions: document.getElementById('manualInstructions').value
            .split('\n')
            .map(i => i.trim())
            .filter(i => i.length > 0),
        source: 'Manual Entry',
        sourceUrl: '',
        thumbnailUrl: '',
        userId: getUserId(),
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
        favorite: false
    };
    
    try {
        const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        recipes.push(recipe);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        
        showStatus(statusEl, '✅ Recipe saved successfully!', 'success');
        
        document.getElementById('manualForm').reset();
        
        setTimeout(() => {
            window.location.href = 'recipe-book.html';
        }, 1500);
    } catch (error) {
        showStatus(statusEl, '❌ Failed to save recipe: ' + error.message, 'error');
    }
});

// Helper Functions
async function extractRecipe(endpoint, data, statusEl) {
    showStatus(statusEl, '⏳ Extracting recipe... This may take 10-30 seconds.', 'loading');
    
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.recipe) {
            const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
            recipes.push(result.recipe);
            localStorage.setItem('recipes', JSON.stringify(recipes));
            
            showStatus(statusEl, '✅ Recipe extracted successfully! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'recipe-book.html';
            }, 1500);
        } else {
            showStatus(statusEl, '❌ ' + (result.error || 'Failed to extract recipe. Please try again.'), 'error');
        }
    } catch (error) {
        console.error('Extraction error:', error);
        
        let errorMessage = '❌ ';
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot connect to server. The API might be sleeping (Render free tier). Please wait 30 seconds and try again.';
        } else if (error.message.includes('Server error')) {
            errorMessage += 'Server error. Please check if your API key is set in Render.';
        } else {
            errorMessage += 'Error: ' + error.message;
        }
        
        showStatus(statusEl, errorMessage, 'error');
    }
}

function showStatus(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = 'status-message show ' + type;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            element.classList.remove('show');
        }, 8000);
    }
}
