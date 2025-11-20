// Meal Plan JavaScript - Recipe Society

const API_URL = 'https://recipe-api-pqbr.onrender.com';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

let mealPlan = {};
let allRecipes = [];
let currentAddingSlot = null;
let dinnerOnlyMode = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMealPlan();
    loadRecipes();
    renderMealCards();
    setupEventListeners();
});

function loadMealPlan() {
    const saved = localStorage.getItem('mealPlan');
    if (saved) {
        mealPlan = JSON.parse(saved);
    } else {
        // Initialize empty meal plan
        DAYS.forEach(day => {
            mealPlan[day] = {
                breakfast: null,
                lunch: null,
                dinner: null
            };
        });
    }
}

function saveMealPlan() {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
}

function loadRecipes() {
    const recipes = localStorage.getItem('recipes');
    if (recipes) {
        allRecipes = JSON.parse(recipes);
    }
}

function renderMealCards() {
    const grid = document.getElementById('mealCardsGrid');
    grid.innerHTML = '';

    DAYS.forEach(day => {
        const card = createDayCard(day);
        grid.appendChild(card);
    });
}

function createDayCard(day) {
    const card = document.createElement('div');
    card.className = 'day-card';
    
    const header = document.createElement('div');
    header.className = 'day-card-header';
    header.textContent = day;
    card.appendChild(header);

    MEALS.forEach(meal => {
        const slot = createMealSlot(day, meal);
        card.appendChild(slot);
    });

    return card;
}

function createMealSlot(day, meal) {
    const slot = document.createElement('div');
    slot.className = 'meal-slot';
    slot.setAttribute('data-meal', meal);

    const label = document.createElement('div');
    label.className = 'meal-slot-label';
    label.textContent = meal.charAt(0).toUpperCase() + meal.slice(1);
    slot.appendChild(label);

    const content = document.createElement('div');
    content.className = 'meal-slot-content';

    const currentMeal = mealPlan[day]?.[meal];
    
    if (currentMeal) {
        const mealItem = document.createElement('div');
        mealItem.className = 'meal-item';
        
        const mealName = document.createElement('span');
        mealName.className = 'meal-item-name';
        mealName.textContent = currentMeal.title || currentMeal;
        mealItem.appendChild(mealName);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'meal-item-remove';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => removeMeal(day, meal);
        mealItem.appendChild(removeBtn);

        content.appendChild(mealItem);
    } else {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-meal-btn';
        addBtn.textContent = 'Add';
        addBtn.onclick = () => openAddMealModal(day, meal);
        content.appendChild(addBtn);
    }

    slot.appendChild(content);
    return slot;
}

function openAddMealModal(day, meal) {
    currentAddingSlot = { day, meal };
    const modal = document.getElementById('addMealModal');
    const title = document.getElementById('addMealTitle');
    title.textContent = `Add ${meal.charAt(0).toUpperCase() + meal.slice(1)} for ${day}`;
    
    renderRecipePicker();
    modal.classList.remove('hidden');
}

function renderRecipePicker(searchTerm = '') {
    const list = document.getElementById('recipePickerList');
    
    if (allRecipes.length === 0) {
        list.innerHTML = '<div class="empty-meal-plan"><p>No recipes yet! Add some recipes first.</p></div>';
        return;
    }

    const filtered = searchTerm
        ? allRecipes.filter(r => r.title?.toLowerCase().includes(searchTerm.toLowerCase()))
        : allRecipes;

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-meal-plan"><p>No recipes found.</p></div>';
        return;
    }

    list.innerHTML = '';
    filtered.forEach(recipe => {
        const item = document.createElement('div');
        item.className = 'recipe-picker-item';
        item.onclick = () => addMealToSlot(recipe);

        const title = document.createElement('div');
        title.className = 'recipe-picker-item-title';
        title.textContent = recipe.title || 'Untitled Recipe';
        item.appendChild(title);

        const source = document.createElement('div');
        source.className = 'recipe-picker-item-source';
        source.textContent = recipe.source || 'Recipe';
        item.appendChild(source);

        list.appendChild(item);
    });
}

function addMealToSlot(recipe) {
    if (!currentAddingSlot) return;

    const { day, meal } = currentAddingSlot;
    mealPlan[day][meal] = {
        id: recipe.id,
        title: recipe.title
    };
    
    saveMealPlan();
    closeAddMealModal();
    renderMealCards();
}

function removeMeal(day, meal) {
    mealPlan[day][meal] = null;
    saveMealPlan();
    renderMealCards();
}

function closeAddMealModal() {
    const modal = document.getElementById('addMealModal');
    modal.classList.add('hidden');
    currentAddingSlot = null;
}

// AI Suggestions
async function getAISuggestions() {
    const modal = document.getElementById('aiSuggestModal');
    const list = document.getElementById('aiSuggestionsList');
    const actions = document.getElementById('suggestionsActions');
    
    modal.classList.remove('hidden');
    list.innerHTML = '<div class="loading-message">Analyzing your recipes and generating suggestions...</div>';
    actions.style.display = 'none';

    if (allRecipes.length === 0) {
        list.innerHTML = '<div class="empty-meal-plan"><h3>No recipes yet!</h3><p>Add some recipes to your collection first, then I can suggest meal plans.</p></div>';
        return;
    }

    try {
        // Prepare recipe list for Claude
        const recipeList = allRecipes.map(r => r.title).join(', ');
        
        const prompt = `I have these recipes: ${recipeList}

Create a balanced weekly meal plan using ONLY these recipes. For each day, suggest:
- Breakfast
- Lunch  
- Dinner

Consider:
- Variety (don't repeat recipes)
- Balance (mix of proteins, veggies, carbs)
- Use as many different recipes as possible

Return ONLY valid JSON (no markdown):
{
  "Monday": {"breakfast": "Recipe Name", "lunch": "Recipe Name", "dinner": "Recipe Name"},
  "Tuesday": {"breakfast": "Recipe Name", "lunch": "Recipe Name", "dinner": "Recipe Name"},
  ...for all 7 days
}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) throw new Error('Failed to get suggestions');

        const data = await response.json();
        let suggestionsText = data.content[0].text.trim();
        suggestionsText = suggestionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const suggestions = JSON.parse(suggestionsText);
        
        renderAISuggestions(suggestions);
        actions.style.display = 'block';
        
    } catch (error) {
        console.error('AI Suggestions error:', error);
        list.innerHTML = '<div class="empty-meal-plan"><h3>Oops!</h3><p>Could not generate suggestions. Make sure your backend is running and try again.</p></div>';
    }
}

function renderAISuggestions(suggestions) {
    const list = document.getElementById('aiSuggestionsList');
    list.innerHTML = '';

    DAYS.forEach(day => {
        if (!suggestions[day]) return;

        const dayDiv = document.createElement('div');
        dayDiv.className = 'ai-suggestion-day';

        const dayTitle = document.createElement('div');
        dayTitle.className = 'ai-suggestion-day-title';
        dayTitle.textContent = day;
        dayDiv.appendChild(dayTitle);

        const mealsDiv = document.createElement('div');
        mealsDiv.className = 'ai-suggestion-meals';

        MEALS.forEach(meal => {
            if (!suggestions[day][meal]) return;

            const mealDiv = document.createElement('div');
            mealDiv.className = 'ai-suggestion-meal';

            const label = document.createElement('span');
            label.className = 'ai-suggestion-meal-label';
            label.textContent = meal.charAt(0).toUpperCase() + meal.slice(1) + ':';
            mealDiv.appendChild(label);

            const name = document.createElement('span');
            name.className = 'ai-suggestion-meal-name';
            name.textContent = suggestions[day][meal];
            mealDiv.appendChild(name);

            mealsDiv.appendChild(mealDiv);
        });

        dayDiv.appendChild(mealsDiv);
        list.appendChild(dayDiv);
    });

    // Store suggestions for applying
    list.dataset.suggestions = JSON.stringify(suggestions);
}

function applySuggestions() {
    const list = document.getElementById('aiSuggestionsList');
    const suggestions = JSON.parse(list.dataset.suggestions || '{}');

    DAYS.forEach(day => {
        if (!suggestions[day]) return;

        MEALS.forEach(meal => {
            const suggestedMeal = suggestions[day][meal];
            if (!suggestedMeal) return;

            // Find matching recipe
            const recipe = allRecipes.find(r => 
                r.title?.toLowerCase() === suggestedMeal.toLowerCase()
            );

            if (recipe) {
                mealPlan[day][meal] = {
                    id: recipe.id,
                    title: recipe.title
                };
            }
        });
    });

    saveMealPlan();
    closeAISuggestModal();
    renderMealCards();
}

function closeAISuggestModal() {
    const modal = document.getElementById('aiSuggestModal');
    modal.classList.add('hidden');
}

function toggleDinnerOnly() {
    dinnerOnlyMode = !dinnerOnlyMode;
    const btn = document.getElementById('dinnerOnlyToggle');
    
    if (dinnerOnlyMode) {
        document.body.classList.add('dinner-only-mode');
        btn.classList.add('active');
    } else {
        document.body.classList.remove('dinner-only-mode');
        btn.classList.remove('active');
    }
}

function clearWeek() {
    if (!confirm('Clear entire week? This cannot be undone.')) return;

    DAYS.forEach(day => {
        MEALS.forEach(meal => {
            mealPlan[day][meal] = null;
        });
    });

    saveMealPlan();
    renderMealCards();
}

// Event Listeners
function setupEventListeners() {
    // AI Suggestions
    document.getElementById('aiSuggestBtn').addEventListener('click', getAISuggestions);
    document.getElementById('applySuggestionsBtn').addEventListener('click', applySuggestions);
    document.getElementById('closeAiSuggest').addEventListener('click', closeAISuggestModal);

    // Dinner Only Toggle
    document.getElementById('dinnerOnlyToggle').addEventListener('click', toggleDinnerOnly);

    // Clear Week
    document.getElementById('clearWeekBtn').addEventListener('click', clearWeek);

    // Close Add Meal Modal
    document.getElementById('closeAddMeal').addEventListener('click', closeAddMealModal);

    // Recipe Search
    document.getElementById('recipePickerSearch').addEventListener('input', (e) => {
        renderRecipePicker(e.target.value);
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            closeAddMealModal();
            closeAISuggestModal();
        });
    });
}
