// Recipe Book JavaScript - Clean Version (No Emojis)

let recipes = [];
let filteredRecipes = [];
let currentView = 'grid';

// DOM Elements
const recipesContainer = document.getElementById('recipesContainer');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const sourceFilter = document.getElementById('sourceFilter');
const sortFilter = document.getElementById('sortFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const filterDropdown = document.getElementById('filterDropdown');
const totalCount = document.getElementById('totalCount');
const tiktokCount = document.getElementById('tiktokCount');
const instagramCount = document.getElementById('instagramCount');
const favoriteCount = document.getElementById('favoriteCount');
const modal = document.getElementById('recipeModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.querySelector('.modal-close');

// Event Listeners
searchInput.addEventListener('input', applyFilters);
sourceFilter.addEventListener('change', applyFilters);
sortFilter.addEventListener('change', applyFilters);
clearFiltersBtn.addEventListener('click', clearFilters);

// Hamburger Menu Toggle
hamburgerMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!filterDropdown.contains(e.target) && e.target !== hamburgerMenu) {
        filterDropdown.classList.add('hidden');
    }
});

modalClose.addEventListener('click', closeModal);
modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

// Initialize
loadRecipes();
updateStats();
applyFilters();

// Functions
function loadRecipes() {
    try {
        const saved = localStorage.getItem('recipes');
        if (saved) {
            recipes = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Failed to load recipes:', error);
        recipes = [];
    }
}

function updateStats() {
    totalCount.textContent = recipes.length;
    tiktokCount.textContent = recipes.filter(r => r.source !== 'Instagram').length;
    instagramCount.textContent = recipes.filter(r => r.source === 'Instagram').length;
    favoriteCount.textContent = recipes.filter(r => r.favorite).length;
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedSource = sourceFilter.value;
    const selectedSort = sortFilter.value;
    
    // Filter recipes
    filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = !searchTerm || 
            recipe.title?.toLowerCase().includes(searchTerm) ||
            recipe.description?.toLowerCase().includes(searchTerm) ||
            recipe.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm));
        
        const matchesSource = selectedSource === 'all' || 
            (selectedSource === 'TikTok' && recipe.source !== 'Instagram') ||
            recipe.source === selectedSource;
        
        return matchesSearch && matchesSource;
    });
    
    // Sort recipes
    filteredRecipes.sort((a, b) => {
        switch (selectedSort) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'name-asc':
                return (a.title || '').localeCompare(b.title || '');
            case 'name-desc':
                return (b.title || '').localeCompare(a.title || '');
            default:
                return 0;
        }
    });
    
    renderRecipes();
}

function renderRecipes() {
    if (filteredRecipes.length === 0) {
        recipesContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    recipesContainer.innerHTML = filteredRecipes.map((recipe, index) => `
        <div class="recipe-card-compact" onclick="openRecipeModal(${recipes.indexOf(recipe)})">
            ${recipe.thumbnailUrl ? `
                <img src="${recipe.thumbnailUrl}" alt="${recipe.title}" class="recipe-card-thumbnail">
            ` : ''}
            
            <div class="recipe-card-body">
                <h3 class="recipe-card-title">${recipe.title || 'Untitled Recipe'}</h3>
                
                ${recipe.prepTime || recipe.cookTime || recipe.servings ? `
                    <div class="recipe-card-meta">
                        ${recipe.prepTime ? `
                            <span class="recipe-card-meta-item">${recipe.prepTime}</span>
                        ` : ''}
                        ${recipe.cookTime ? `
                            <span class="recipe-card-meta-item">${recipe.cookTime}</span>
                        ` : ''}
                        ${recipe.servings ? `
                            <span class="recipe-card-meta-item">${recipe.servings} servings</span>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${recipe.description ? `
                    <p class="recipe-card-description">${recipe.description}</p>
                ` : ''}
                
                <div class="recipe-card-footer">
                    <div class="recipe-source-tag">
                        ${recipe.source || 'TikTok'}
                    </div>
                    
                    <div class="recipe-actions" onclick="event.stopPropagation()">
                        <button class="action-btn favorite ${recipe.favorite ? 'active' : ''}" 
                                onclick="toggleFavorite(${recipes.indexOf(recipe)})">
                            ${recipe.favorite ? 'â¤ï¸' : 'ðŸ¤'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function openRecipeModal(index) {
    const recipe = recipes[index];
    
    modalBody.innerHTML = `
        <div class="recipe-detail">
            ${recipe.thumbnailUrl ? `
                <img src="${recipe.thumbnailUrl}" alt="${recipe.title}" 
                     style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 16px; margin-bottom: 32px;">
            ` : ''}
            
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                <h2 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; color: #0a0a0a; line-height: 1.2; letter-spacing: -1px;">${recipe.title || 'Untitled Recipe'}</h2>
                <button class="action-btn favorite ${recipe.favorite ? 'active' : ''}" 
                        onclick="toggleFavorite(${index}); openRecipeModal(${index})"
                        style="font-size: 24px; padding: 10px 14px;">
                    ${recipe.favorite ? 'â¤ï¸' : 'ðŸ¤'}
                </button>
            </div>
            
            ${recipe.source ? `
                <div style="margin-bottom: 16px;">
                    <span style="background: rgba(0,0,0,0.05); color: #0a0a0a; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${recipe.source}
                    </span>
                </div>
            ` : ''}
            
            ${recipe.prepTime || recipe.cookTime || recipe.servings || recipe.difficulty ? `
                <div style="display: flex; gap: 24px; margin-bottom: 28px; flex-wrap: wrap;">
                    ${recipe.prepTime ? `
                        <div>
                            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Prep Time</div>
                            <div style="font-weight: 600; font-size: 16px;">${recipe.prepTime}</div>
                        </div>
                    ` : ''}
                    ${recipe.cookTime ? `
                        <div>
                            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Cook Time</div>
                            <div style="font-weight: 600; font-size: 16px;">${recipe.cookTime}</div>
                        </div>
                    ` : ''}
                    ${recipe.servings ? `
                        <div>
                            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Servings</div>
                            <div style="font-weight: 600; font-size: 16px;">${recipe.servings}</div>
                        </div>
                    ` : ''}
                    ${recipe.difficulty ? `
                        <div>
                            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Difficulty</div>
                            <div style="font-weight: 600; font-size: 16px;">${recipe.difficulty}</div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            
            ${recipe.description ? `
                <p style="color: #666; line-height: 1.7; margin-bottom: 32px; font-size: 15px;">${recipe.description}</p>
            ` : ''}
            
            ${recipe.ingredients && recipe.ingredients.length > 0 ? `
                <div style="margin-bottom: 36px;">
                    <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; margin-bottom: 20px; color: #0a0a0a;">Ingredients</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${recipe.ingredients.map(ing => {
                            if (!ing || typeof ing !== 'string' || ing.trim() === '') return '';
                            return `<li style="padding: 14px 18px; background: #e8eef7; margin-bottom: 10px; border-radius: 10px; border-left: 4px solid #8b9d83; font-size: 15px; line-height: 1.6; color: #333;">
                                ${ing.trim()}
                            </li>`;
                        }).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${recipe.instructions && recipe.instructions.length > 0 ? `
                <div style="margin-bottom: 36px;">
                    <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; margin-bottom: 20px; color: #0a0a0a;">Instructions</h3>
                    <ol style="padding-left: 0; counter-reset: step; margin: 0;">
                        ${recipe.instructions.map((step, idx) => {
                            if (!step || typeof step !== 'string' || step.trim() === '') return '';
                            return `<li style="padding: 18px; padding-left: 70px; background: #e8eef7; margin-bottom: 12px; border-radius: 10px; list-style: none; position: relative; counter-increment: step; font-size: 15px; line-height: 1.7; color: #333;">
                                <div style="position: absolute; left: 18px; top: 18px; width: 36px; height: 36px; background: #8b9d83; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;">
                                    ${idx + 1}
                                </div>
                                ${step.trim()}
                            </li>`;
                        }).join('')}
                    </ol>
                </div>
            ` : ''}
            
            ${recipe.notes ? `
                <div style="background: #fff9e6; padding: 20px; border-radius: 12px; border-left: 4px solid #ffd700; margin-bottom: 24px;">
                    <h3 style="font-size: 18px; margin-bottom: 8px; color: #333; font-weight: 600;">Notes</h3>
                    <p style="color: #666; line-height: 1.6; margin: 0;">${recipe.notes}</p>
                </div>
            ` : ''}
            
            ${recipe.tags && recipe.tags.length > 0 ? `
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
                    ${recipe.tags.map(tag => `
                        <span style="background: #8b9d83; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            ` : ''}
            
            ${recipe.sourceUrl ? `
                <div style="padding-top: 24px; border-top: 2px solid #f0f0f0;">
                    <a href="${recipe.sourceUrl}" target="_blank" 
                       style="color: #8b9d83; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                        View Original Post â†’
                    </a>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function toggleFavorite(index) {
    recipes[index].favorite = !recipes[index].favorite;
    saveRecipes();
    updateStats();
    applyFilters();
}

function saveRecipes() {
    try {
        localStorage.setItem('recipes', JSON.stringify(recipes));
    } catch (error) {
        console.error('Failed to save recipes:', error);
    }
}

function clearFilters() {
    searchInput.value = '';
    sourceFilter.value = 'all';
    sortFilter.value = 'newest';
    applyFilters();
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});
SimplyCodes

