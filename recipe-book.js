

// Recipe Book JavaScript - ShopMy Style Horizontal Cards

let allRecipes = [];
let filteredRecipes = [];

// Load recipes on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    setupSearch();
    setupFilters();
});

function loadRecipes() {
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    allRecipes = recipes;
    filteredRecipes = recipes;
    displayRecipes(recipes);
    updateRecipeCount(recipes.length);
}

function displayRecipes(recipes) {
    const container = document.getElementById('recipeGrid');
    
    if (recipes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--color-warm-gray);">
                <p style="font-size: 18px; margin-bottom: 12px;">No recipes yet!</p>
                <p style="font-size: 14px;">Import your first recipe to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-card-horizontal" onclick="openRecipeModal(${recipes.indexOf(recipe)})">
            ${recipe.thumbnailUrl ? `
                <div class="recipe-card-image">
                    <img src="${recipe.thumbnailUrl}" alt="${recipe.title}">
                </div>
            ` : `
                <div class="recipe-card-image recipe-card-no-image">
                    <span style="font-size: 48px;">🍽️</span>
                </div>
            `}
            <div class="recipe-card-content">
                <h3 class="recipe-card-title">${recipe.title || 'Untitled Recipe'}</h3>
                
                ${recipe.description ? `
                    <p class="recipe-card-description">${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}</p>
                ` : ''}
                
                <div class="recipe-card-meta">
                    ${recipe.prepTime ? `<span>⏱️ ${recipe.prepTime}</span>` : ''}
                    ${recipe.servings ? `<span>🍽️ ${recipe.servings} servings</span>` : ''}
                </div>
                
                <div class="recipe-card-footer">
                    <span class="recipe-source-badge">${recipe.source || 'Recipe'}</span>
                    <button class="favorite-btn ${recipe.favorite ? 'active' : ''}" onclick="toggleFavorite(event, ${recipes.indexOf(recipe)})">
                        ${recipe.favorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateRecipeCount(count) {
    const countEl = document.getElementById('recipeCount');
    if (countEl) {
        countEl.textContent = `${count} recipe${count !== 1 ? 's' : ''} saved`;
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filteredRecipes = allRecipes.filter(recipe => {
                return (recipe.title?.toLowerCase().includes(query)) ||
                       (recipe.ingredients?.some(ing => ing.toLowerCase().includes(query))) ||
                       (recipe.tags?.some(tag => tag.toLowerCase().includes(query)));
            });
            displayRecipes(filteredRecipes);
            updateRecipeCount(filteredRecipes.length);
        });
    }
}

function setupFilters() {
    const sourceFilter = document.getElementById('sourceFilter');
    const filterDropdown = document.getElementById('filterDropdown');
    
    if (sourceFilter && filterDropdown) {
        sourceFilter.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            filterDropdown.classList.remove('show');
        });
        
        filterDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

function filterBySource(source) {
    if (source === 'all') {
        filteredRecipes = allRecipes;
    } else {
        filteredRecipes = allRecipes.filter(recipe => recipe.source === source);
    }
    displayRecipes(filteredRecipes);
    updateRecipeCount(filteredRecipes.length);
    document.getElementById('filterDropdown').classList.remove('show');
}

function filterByFavorites() {
    filteredRecipes = allRecipes.filter(recipe => recipe.favorite);
    displayRecipes(filteredRecipes);
    updateRecipeCount(filteredRecipes.length);
    document.getElementById('filterDropdown').classList.remove('show');
}

function toggleFavorite(event, index) {
    event.stopPropagation();
    allRecipes[index].favorite = !allRecipes[index].favorite;
    localStorage.setItem('recipes', JSON.stringify(allRecipes));
    displayRecipes(filteredRecipes);
}

function openRecipeModal(index) {
    const recipe = filteredRecipes[index];
    const modal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalRecipeContent');
    
    modalContent.innerHTML = `
        <div class="modal-recipe-header">
            ${recipe.thumbnailUrl ? `
                <img src="${recipe.thumbnailUrl}" alt="${recipe.title}" class="modal-recipe-image">
            ` : ''}
            <h2 class="modal-recipe-title">${recipe.title}</h2>
            ${recipe.description ? `<p class="modal-recipe-description">${recipe.description}</p>` : ''}
            
            <div class="modal-recipe-meta">
                ${recipe.prepTime ? `<span>⏱️ Prep: ${recipe.prepTime}</span>` : ''}
                ${recipe.cookTime ? `<span>🔥 Cook: ${recipe.cookTime}</span>` : ''}
                ${recipe.servings ? `<span>🍽️ Servings: ${recipe.servings}</span>` : ''}
            </div>
            
            <span class="recipe-source-badge">${recipe.source || 'Recipe'}</span>
        </div>
        
        <div class="modal-recipe-body">
            <div class="modal-section">
                <h3>Ingredients</h3>
                <ul class="ingredients-list">
                    ${recipe.ingredients?.map(ing => `<li>${ing}</li>`).join('') || '<li>No ingredients listed</li>'}
                </ul>
            </div>
            
            <div class="modal-section">
                <h3>Instructions</h3>
                <ol class="instructions-list">
                    ${recipe.instructions?.map(step => `<li>${step}</li>`).join('') || '<li>No instructions provided</li>'}
                </ol>
            </div>
            
            ${recipe.notes ? `
                <div class="modal-section">
                    <h3>Notes</h3>
                    <p>${recipe.notes}</p>
                </div>
            ` : ''}
        </div>
        
        <div class="modal-recipe-footer">
            ${recipe.sourceUrl ? `<a href="${recipe.sourceUrl}" target="_blank" class="source-link">View Original</a>` : ''}
            <button onclick="deleteRecipe(${index})" class="delete-btn">Delete Recipe</button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('recipeModal').style.display = 'none';
}

function deleteRecipe(index) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        const recipeToDelete = filteredRecipes[index];
        const globalIndex = allRecipes.findIndex(r => r.id === recipeToDelete.id);
        allRecipes.splice(globalIndex, 1);
        filteredRecipes = allRecipes;
        localStorage.setItem('recipes', JSON.stringify(allRecipes));
        closeModal();
        displayRecipes(allRecipes);
        updateRecipeCount(allRecipes.length);
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('recipeModal');
    if (event.target === modal) {
        closeModal();
    }
}
