// Global variables needed across both pages (user/cart data, language)
let currentLanguage = 'ml';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

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

// Function to handle Dark Mode Toggle (simplified for shared use)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Apply dark mode immediately on load
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Attach dark mode toggle to buttons on both pages
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
            // Find the button if navigated via code (e.g., from login)
            const targetNav = document.querySelector(`.bottom-nav .nav-item[data-target="${targetId}"]`);
            if (targetNav) targetNav.classList.add('active');
        }
        
        // Ensure the back button is functional
        if (targetId === 'home') {
            document.querySelector('.bottom-nav .nav-item[data-target="home"]').classList.add('active');
        }
    }

    function switchLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.querySelectorAll('.lang-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`lang-${lang}`).classList.add('active');
        // --- (Add full language translation logic here) ---
    }

    function loadInitialState() {
        // Check for language preference
        currentLanguage = localStorage.getItem('language') || 'ml';
        switchLanguage(currentLanguage);

        // Check for user login info
        if (userInfo && userInfo.name && userInfo.phone) {
            // If logged in, skip login screen
            showScreen('home');
        } else {
            // If not logged in, show login screen
            showScreen('login');
        }
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
    }

    function addToCart() {
        // Placeholder logic for adding a book
        const bookTitle = document.getElementById('detail-title').textContent.trim();
        const bookPriceText = document.getElementById('detail-price').textContent.replace('₹', '').trim();
        const bookPrice = parseFloat(bookPriceText);

        const existingItem = cart.find(item => item.title === bookTitle);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ title: bookTitle, price: bookPrice, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${bookTitle} കാർട്ടിലേക്ക് ചേർത്തു!`);
    }

    // --- Event Listeners for index.html ---
    document.addEventListener('DOMContentLoaded', () => {
        
        // Load the initial state (Login or Home)
        loadInitialState();
        
        // Language buttons
        document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
        document.getElementById('lang-ml').addEventListener('click', () => switchLanguage('ml'));
        
        // Continue button on Login screen
        document.getElementById('continue-btn').addEventListener('click', handleContinueBtn);
        
        // The Checkout button handler in Cart screen is handled by the simple inline `onclick="location.href = 'checkout.html'"` in the HTML
    });

}

// =================================================================
// 3. CHECKOUT LOGIC (Only runs when checkout.html is loaded)
// =================================================================
else if (pathname.includes('checkout.html')) {

    // --- Checkout-Specific Functions ---
    
    function showCheckoutScreen(id) {
        document.getElementById('checkout-screen').style.display = 'none';
        document.getElementById('thank-you-screen').style.display = 'none';
        
        const targetScreen = document.getElementById(id);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
        }
    }

    function loadCheckoutData() {
        // Load User Info from local storage
        const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (user.name && user.phone) {
            document.getElementById('checkout-name').value = user.name;
            document.getElementById('checkout-phone').value = user.phone;
        } else {
            // Handle error or redirect if user info is missing
            alert("User data missing. Redirecting to home.");
            location.href = 'index.html';
            return;
        }

        // Load Cart Data from local storage
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (currentCart.length === 0) {
            alert("Cart is empty. Redirecting to cart page.");
            location.href = 'index.html?screen=cart';
            return;
        }

        // Simplified data display (assuming one item for now based on your HTML)
        const item = currentCart[0]; // Get the first item
        const totalPrice = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        document.getElementById('checkout-qty').textContent = item.quantity;
        document.getElementById('checkout-price').textContent = `₹${item.price.toFixed(2)}`;
        document.getElementById('checkout-total-price').textContent = `₹${totalPrice.toFixed(2)}`;
    }

    function handlePayNow() {
        const address = document.getElementById('full-address').value.trim();
        const pincode = document.getElementById('pincode').value.trim();
        
        let isValid = true;
        
        // Address validation
        if (address.length < 10) {
            document.getElementById('address-error').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('address-error').style.display = 'none';
        }

        // Pincode validation
        if (pincode.length !== 6 || isNaN(pincode)) {
            document.getElementById('pincode-error').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('pincode-error').style.display = 'none';
        }

        if (isValid) {
            // --- ACTUAL PAYMENT PROCESSING LOGIC HERE ---
            // Simulate successful payment
            
            // Clear cart after successful transaction
            localStorage.removeItem('cart');
            updateCartCount(); // Reset badge
            
            showCheckoutScreen('thank-you-screen');
        }
    }

    // --- Event Listeners for checkout.html ---
    document.addEventListener('DOMContentLoaded', () => {
        // Set the default screen for this page
        showCheckoutScreen('checkout-screen');
        
        // Load user and cart data
        loadCheckoutData();

        // Pay Now button
        const payNowBtn = document.getElementById('pay-now-btn');
        if (payNowBtn) {
            payNowBtn.addEventListener('click', handlePayNow);
        }
        
        // Back button on Thank You screen (to return to Checkout details)
        const thankYouBackBtn = document.querySelector('#thank-you-screen .header-with-back .back-btn');
        if (thankYouBackBtn) {
            thankYouBackBtn.addEventListener('click', () => showCheckoutScreen('checkout-screen'));
        }
    });
}
// =================================================================