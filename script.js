// Global variables needed across both pages (user/cart data, language)
let currentLanguage = 'ml';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
const MAIN_NAV_ID = 'main-bottom-nav';

// =================================================================
// 0. GLOBAL PLACEHOLDER FUNCTIONS (FIXES INLINE ONCLICK ERRORS)
// These must be defined globally so the HTML can reference them immediately.
// =================================================================

function showBookDetails(title, price, category, id) { 
    // This function must exist globally to be called from the Home screen's onclick
    // alert(`Attempting to view details for: ${title}`);
    showScreen('book-details'); // Placeholder logic
}

function addToCart() { 
    // This must exist globally for the Book Details screen's button to work
    // alert('Book added to cart!');
}

function buyNow() {
    // This must exist globally for the Book Details screen's button to work
    // alert('Buying now!');
}


// =================================================================
// 1. SHARED/GLOBAL FUNCTIONS (Run on both index.html and checkout.html)
// =================================================================

function updateCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalQty;
        el.style.display = totalQty > 0 ? 'block' : 'none';
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.dark-mode-toggle').forEach(button => {
        button.addEventListener('click', toggleDarkMode);
    });
    updateCartCount();
});


// =================================================================
// 2. MAIN APPLICATION LOGIC (Only runs when index.html is loaded)
// =================================================================

const pathname = window.location.pathname;

if (pathname.includes('index.html') || pathname === '/') {
    
    // --- Index-Specific Functions ---
    
    function showMainNavigationBar() {
        const navBar = document.getElementById(MAIN_NAV_ID);
        if (navBar) {
            navBar.style.display = 'flex';
        }
    }

    function showScreen(targetId, navButton = null) {
        const screens = document.querySelectorAll('.app-screen');
        screens.forEach(screen => {
            screen.style.display = 'none';
        });
        const targetScreen = document.getElementById(targetId + '-screen');
        if (targetScreen) {
            targetScreen.style.display = 'flex';
        }
        
        // Update navigation bar active state
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        if (navButton) {
            navButton.classList.add('active');
        } else if (['home', 'cart', 'profile'].includes(targetId)) {
            const targetNav = document.querySelector(`.bottom-nav .nav-item[data-target="${targetId}"]`);
            if (targetNav) targetNav.classList.add('active');
        }
    }

    function switchLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.querySelectorAll('.lang-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`lang-${lang}`).classList.add('active');
        // --- (Add full language translation logic here) ---
        // For testing, alert the language change
        // alert(`Language set to ${lang}`); 
    }

    function handleContinueBtn() {
        const nameInput = document.getElementById('name').value.trim();
        const phoneInput = document.getElementById('phone').value.trim();

        if (nameInput === "" || phoneInput.length !== 10) {
            alert("ദയവായി സാധുവായ പേരും 10 അക്ക ഫോൺ നമ്പറും നൽകുക.");
            return;
        }

        userInfo = { name: nameInput, phone: phoneInput };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        showScreen('home');
        showMainNavigationBar(); 
    }

    function loadInitialState() {
        // Check for language preference
        currentLanguage = localStorage.getItem('language') || 'ml';
        switchLanguage(currentLanguage);

        // Check for user login info
        if (userInfo && userInfo.name && userInfo.phone) {
            showScreen('home');
            showMainNavigationBar(); 
        } else {
            showScreen('login');
        }
    }
    
    // --- Event Listeners for index.html ---
    document.addEventListener('DOMContentLoaded', () => {
        
        // This is the first main function called after the DOM is ready
        loadInitialState();
        
        // ACTIVATE LANGUAGE AND CONTINUE BUTTONS
        const langEnBtn = document.getElementById('lang-en');
        const langMlBtn = document.getElementById('lang-ml');
        const continueBtn = document.getElementById('continue-btn'); 

        if (langEnBtn) {
             // You can add a console log here to verify this runs: console.log('Attached EN listener');
             langEnBtn.addEventListener('click', () => switchLanguage('en'));
        }
        if (langMlBtn) {
             // console.log('Attached ML listener');
             langMlBtn.addEventListener('click', () => switchLanguage('ml'));
        }
        
        if (continueBtn) {
            // console.log('Attached Continue listener');
            continueBtn.addEventListener('click', handleContinueBtn);
        }
    });

}

// =================================================================
// 3. CHECKOUT LOGIC (Only runs when checkout.html is loaded)
// =================================================================
else if (pathname.includes('checkout.html')) {
    
    // ... (rest of your checkout.html logic) ...
}