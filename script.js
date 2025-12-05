// Global variables needed across both pages (user/cart data, language)
let currentLanguage = 'ml';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
const MAIN_NAV_ID = 'main-bottom-nav';

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
    
    // Function to show/hide the main bottom navigation bar
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
        showMainNavigationBar(); // FIX: Show nav bar on successful manual login
    }

    function loadInitialState() {
        // Check for language preference
        currentLanguage = localStorage.getItem('language') || 'ml';
        switchLanguage(currentLanguage);

        // Check for user login info
        if (userInfo && userInfo.name && userInfo.phone) {
            // If logged in, skip login screen
            showScreen('home');
            showMainNavigationBar(); // FIX: Show nav bar on auto-login
        } else {
            // If not logged in, show login screen
            showScreen('login');
        }
    }
    
    // Placeholder function (needed to prevent errors from inline HTML)
    function addToCart() { 
        // Implement your addToCart logic here
        // Example: alert('Book added to cart!');
    }
    
    // Placeholder function (needed to prevent errors from inline HTML)
    function buyNow() {
        // Implement your buyNow logic here
        // Example: location.href = 'checkout.html';
    }


    // --- Event Listeners for index.html ---
    document.addEventListener('DOMContentLoaded', () => {
        
        loadInitialState();
        
        // FIX: ACTIVATE LANGUAGE AND CONTINUE BUTTONS
        const langEnBtn = document.getElementById('lang-en');
        const langMlBtn = document.getElementById('lang-ml');
        const continueBtn = document.getElementById('continue-btn'); 

        if (langEnBtn) {
             langEnBtn.addEventListener('click', () => switchLanguage('en'));
        }
        if (langMlBtn) {
             langMlBtn.addEventListener('click', () => switchLanguage('ml'));
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', handleContinueBtn);
        }
    });

}

// =================================================================
// 3. CHECKOUT LOGIC (Only runs when checkout.html is loaded)
// =================================================================
else if (pathname.includes('checkout.html')) {

    // ... (Your checkout-specific functions like showCheckoutScreen, loadCheckoutData, handlePayNow) ...
    // Note: The main navigation bar should remain hidden on checkout.html,
    // but its link to index.html will still work.

    function showCheckoutScreen(id) {
        document.getElementById('checkout-screen').style.display = 'none';
        document.getElementById('thank-you-screen').style.display = 'none';
        
        const targetScreen = document.getElementById(id);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
        }
    }

    function loadCheckoutData() {
        const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (user.name && user.phone) {
            document.getElementById('checkout-name').value = user.name;
            document.getElementById('checkout-phone').value = user.phone;
        } else {
            alert("User data missing. Redirecting to home.");
            location.href = 'index.html';
            return;
        }

        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (currentCart.length === 0) {
            alert("Cart is empty. Redirecting to cart page.");
            location.href = 'index.html?screen=cart';
            return;
        }

        const item = currentCart[0]; 
        const totalPrice = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (document.getElementById('checkout-qty')) document.getElementById('checkout-qty').textContent = item.quantity;
        if (document.getElementById('checkout-price')) document.getElementById('checkout-price').textContent = `₹${item.price.toFixed(2)}`;
        if (document.getElementById('checkout-total-price')) document.getElementById('checkout-total-price').textContent = `₹${totalPrice.toFixed(2)}`;
    }

    function handlePayNow() {
        const address = document.getElementById('full-address').value.trim();
        const pincode = document.getElementById('pincode').value.trim();
        
        let isValid = true;
        
        if (address.length < 10) {
            if (document.getElementById('address-error')) document.getElementById('address-error').style.display = 'block';
            isValid = false;
        } else {
            if (document.getElementById('address-error')) document.getElementById('address-error').style.display = 'none';
        }

        if (pincode.length !== 6 || isNaN(pincode)) {
            if (document.getElementById('pincode-error')) document.getElementById('pincode-error').style.display = 'block';
            isValid = false;
        } else {
            if (document.getElementById('pincode-error')) document.getElementById('pincode-error').style.display = 'none';
        }

        if (isValid) {
            // Success: 
            localStorage.removeItem('cart');
            updateCartCount(); 
            
            showCheckoutScreen('thank-you-screen');
        }
    }

    // --- Event Listeners for checkout.html ---
    document.addEventListener('DOMContentLoaded', () => {
        showCheckoutScreen('checkout-screen');
        loadCheckoutData();

        const payNowBtn = document.getElementById('pay-now-btn');
        if (payNowBtn) {
            payNowBtn.addEventListener('click', handlePayNow);
        }
        
        const thankYouBackBtn = document.querySelector('#thank-you-screen .header-with-back .back-btn');
        if (thankYouBackBtn) {
            thankYouBackBtn.addEventListener('click', () => showCheckoutScreen('checkout-screen'));
        }
    });
}