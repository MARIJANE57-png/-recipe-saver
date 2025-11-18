// FoodBook - Recipe Import JavaScript

const API_URL = 'https://recipe-api-pqbr.onrender.com';

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
    
    if (!url) {
        showStatus(statusEl, 'Please enter a TikTok URL', 'error');
        return;
    }
    
    await extractRecipe('tiktok/auto-extract', { tiktokUrl: url, userId: 'user123' }, statusEl);
});

// Instagram Extraction
document.getElementById('extractInstagramBtn')?.addEventListener('click', async () => {
    const url = document.getElementById('instagramUrl').value.trim();
    const statusEl = document.getElementById('instagramStatus');
    
    if (!url) {
        showStatus(statusEl, 'Please enter an Instagram URL', 'error');
        return;
    }
    
    await extractRecipe('instagram/auto-extract', { instagramUrl: url, userId: 'user123' }, statusEl);
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
    
    await extractRecipe('image/extract', { imageData, userId: 'user123' }, statusEl);
});

// Website URL Extraction
document.getElementById('extractUrlBtn')?.addEventListener('click', async () => {
    const url = document.getElementById('websiteUrl').value.trim();
    const statusEl = document.getElementById('urlStatus');
    
    if (!url) {
        showStatus(statusEl, 'Please enter a website URL', 'error');
        return;
    }
    
    showStatus(statusEl, 'Website extraction coming soon! Use TikTok or Instagram for now.', 'error');
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
        userId: 'user123',
        createdAt: new Date(),
        id: Date.now().toString()
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
        showStatus(statusEl, 'Failed to save recipe: ' + error.message, 'error');
    }
});

// Helper Functions
async function extractRecipe(endpoint, data, statusEl) {
    showStatus(statusEl, '⏳ Extracting recipe...', 'loading');
    
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
            recipes.push(result.recipe);
            localStorage.setItem('recipes', JSON.stringify(recipes));
            
            showStatus(statusEl, '✅ Recipe extracted successfully!', 'success');
            
            setTimeout(() => {
                window.location.href = 'recipe-book.html';
            }, 1500);
        } else {
            showStatus(statusEl, '❌ ' + (result.error || 'Failed to extract recipe'), 'error');
        }
    } catch (error) {
        showStatus(statusEl, '❌ Error: ' + error.message, 'error');
    }
}

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = 'status-message show ' + type;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }
}
SimplyCodes

