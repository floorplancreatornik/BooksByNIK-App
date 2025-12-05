// =======================================================
// 1. GLOBAL STATE AND HELPER DATA
// =======================================================

// All possible screens that need managing, primarily on home.html and checkout.html
const APP_SCREENS = [
    'home-screen', 'cart-screen', 'profile-screen', 
    'book-details-screen', 'checkout-screen', 'thank-you-screen',
    'login-screen' // Included for completeness but managed by index.html load
];

// Data structure to simulate book list and cart items
const bookData = [
    {id: 'WOH001', title: 'ഹൃദയത്തിന്റെ മന്ത്രണങ്ങൾ', price: 299, author: 'NIK', category: 'Poetry', lang: 'ml', description: 'ആത്മാവിൻ്റെ സ്പർശമുള്ള പ്രണയ കവിതകളുടെ സമാഹാരം.'},
    {id: 'ADVE002', title: 'സഹ്യാദ്രിയിലെ നിഴലുകൾ', price: 450, author: 'NIK', category: 'Adventure', lang: 'ml', description: 'സഹ്യപർവത നിരകളിലൂടെയുള്ള ഒരു സാഹസിക യാത്ര.'},
    // Add more book objects here as needed
];

let cart = JSON.parse(localStorage.getItem('cart')) || []; 

// =======================================================
// 2. PAGE CONTEXT AND INITIALIZATION
// =======================================================

/**
 * Determines which HTML page the script is currently running on.
 * @returns {'index' | 'home' | 'checkout'}
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('checkout.html')) return 'checkout';
    if (path.includes('home.html')) return 'home';
    return 'index';
}

/**
 * Main initialization function run on window load.
 */
window.addEventListener('load', () => {
    const page = getCurrentPage();

    // Attach dark mode toggle listener globally (for all pages)
    document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
        btn.addEventListener('click', toggleDarkMode);
    });

    // Run page-specific initialization
    if (page === 'index') {
        handleIndexInit();
    } else if (page === 'home') {
        handleHomeInit();
    } else if (page === 'checkout') {
        handleCheckoutInit();
    }
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // Save dark mode preference
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// =======================================================
// 3. INDEX.HTML (Login/Redirect Logic)
// =======================================================

function validateAndRedirect() {
    if (getCurrentPage() !== 'index') return;
    
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (name === "" || phone.length !== 10 || isNaN(phone)) {
        alert("ദയവായി സാധുവായ പേരും 10 അക്ക ഫോൺ നമ്പറും നൽകുക."); // Malayalam for prompt
        nameInput.focus();
        return;
    }

    // Store user data
    localStorage.setItem('userName', name);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('isLoggedIn', 'true');

    // Redirect to the main app page
    window.location.href = 'home.html';
}

function handleIndexInit() {
    if (getCurrentPage() !== 'index') return;
    
    // Check for existing login state and auto-redirect
    if (localStorage.getItem('isLoggedIn') === 'true') {
         window.location.href = 'home.html';
         return;
    }

    // Language toggle visual effect
    document.querySelectorAll('.lang-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.lang-button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// =======================================================
// 4. HOME.HTML (Internal Navigation and Cart Management)
// =======================================================

/**
 * Switches between internal screens on home.html
 * @param {string} screenId - The ID of the screen to show ('home', 'cart', 'profile', 'book-details')
 * @param {HTMLElement} [navElement=null] - The nav button clicked (optional)
 */
function showScreen(screenId, navElement = null) {
    if (getCurrentPage() !== 'home') return; 

    const bottomNav = document.getElementById('main-bottom-nav');
    const bottomActionsBar = document.querySelector('.bottom-actions-bar');
    
    // 1. Hide all screens
    APP_SCREENS.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.style.display = 'none';
    });
    
    // 2. Show the target screen
    const targetScreen = document.getElementById(screenId + '-screen');
    if (targetScreen) targetScreen.style.display = 'flex';

    // 3. Update Nav Bar state
    if (bottomNav) bottomNav.style.display = 'flex'; // Nav is always visible in home.html (unless details screen)
    if (bottomActionsBar) bottomActionsBar.style.display = 'none';

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    if (['home', 'cart', 'profile'].includes(screenId)) {
        const targetNav = document.querySelector(`.nav-item[data-target="${screenId}"]`);
        if (targetNav) targetNav.classList.add('active');
    }

    // 4. Special Handling for screens
    if (screenId === 'cart') {
        renderCart();
    }
    if (screenId === 'book-details') {
        if (bottomNav) bottomNav.style.display = 'none'; // Hide main nav on details
        if (bottomActionsBar) bottomActionsBar.style.display = 'flex'; // Show actions bar on details
    }
}

/**
 * Renders detailed content for a specific book and switches to the details screen.
 */
let currentBookId = null; // Store the ID of the book currently being viewed

function showBookDetails(title, price, category, id) {
    if (getCurrentPage() !== 'home') return;
    
    currentBookId = id; // Set global state for cart function
    const book = bookData.find(b => b.id === id);

    const detailsContent = document.querySelector('.book-details-content');
    if (!book) {
        detailsContent.innerHTML = `<p>Error: Book details not found for ID: ${id}</p>`;
        showScreen('book-details');
        return;
    }
    
    // Render the content
    detailsContent.innerHTML = `
        <img src="images/placeholder.png" alt="${book.title} Cover" style="width: 100%; height: auto; border-radius: 8px;">
        <h3 style="margin-top: 15px;">${book.title}</h3>
        <p>രചന: ${book.author}</p>
        <p>വിഭാഗം: ${book.category}</p>
        <p style="font-size: 1.5em; font-weight: bold; color: var(--primary-color);">വില: ₹${book.price}</p>
        <p style="margin-top: 15px;">${book.description}</p>
    `;

    // Update 'Buy Now' button if needed (optional)

    showScreen('book-details');
}

/**
 * Adds the currently viewed book to the cart.
 */
function addToCart() {
    if (getCurrentPage() !== 'home' || !currentBookId) return;
    
    const book = bookData.find(b => b.id === currentBookId);
    if (!book) return;

    const existingItem = cart.find(item => item.id === currentBookId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...book, quantity: 1});
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    const addButton = document.getElementById('add-to-cart-btn');
    addButton.innerText = `🛒 കാർട്ടിലേക്ക് ചേർത്തു! (${(existingItem ? existingItem.quantity + 1 : 1)})`;
    setTimeout(() => {
        addButton.innerText = '🛒 കാർട്ടിലേക്ക് ചേർക്കുക';
    }, 1500);

    // Optionally go back to home or cart
    // showScreen('home'); 
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

function renderCart() {
    if (getCurrentPage() !== 'home') return;
    
    const cartScreen = document.getElementById('cart-screen');
    const existingItemsList = cartScreen.querySelector('.cart-items-list');
    
    // Add a container if it doesn't exist
    let itemsList = existingItemsList;
    if (!itemsList) {
        itemsList = document.createElement('div');
        itemsList.classList.add('cart-items-list');
        cartScreen.insertBefore(itemsList, cartScreen.querySelector('.cart-actions'));
    }

    let cartHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartHTML = `<p style="text-align: center; margin-top: 50px;">കാർട്ടിൽ നിലവിൽ പുസ്തകങ്ങളൊന്നും ചേർത്തിട്ടില്ല.</p>`;
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            cartHTML += `
                <div class="book-card cart-item" style="margin-bottom: 20px;">
                    <img src="images/placeholder.png" alt="Cover" class="book-cover">
                    <div class="book-details" style="flex-grow: 1;">
                        <div class="book-title-ml">${item.title}</div>
                        <div class="book-author">വില: ₹${item.price} x ${item.quantity}</div>
                        <div class="book-category" style="font-weight: bold;">ആകെ: ₹${itemTotal}</div>
                    </div>
                    <button onclick="removeFromCart(${index})" style="background: red; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">-</button>
                </div>
            `;
        });
        cartHTML += `<h3 style="text-align: right; padding: 10px; border-top: 1px solid var(--border-color);">മൊത്തം തുക: ₹${total}</h3>`;
    }

    itemsList.innerHTML = cartHTML;
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        renderCart(); // Re-render the cart view
    }
}

function buyNow() {
    // If Buy Now is clicked, ensure only the current book is in cart before redirecting.
    if (!currentBookId) {
        alert("പുസ്തകം തിരഞ്ഞെടുക്കുക.");
        return;
    }
    
    // 1. Find the current book details
    const book = bookData.find(b => b.id === currentBookId);

    // 2. Overwrite cart with only this one book (for immediate purchase)
    cart = [{...book, quantity: 1}];
    localStorage.setItem('cart', JSON.stringify(cart));

    // 3. Redirect
    window.location.href = 'checkout.html';
}

function handleHomeInit() {
    if (getCurrentPage() !== 'home') return;
    
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Initial setup: Show the home screen and hide others
    // The showScreen function handles hiding all and showing one.
    showScreen('home'); 
    
    // Set initial active state for nav bar
    const homeNav = document.querySelector('.nav-item[data-target="home"]');
    if (homeNav) homeNav.classList.add('active');

    updateCartBadge();
}

// =======================================================
// 5. CHECKOUT.HTML (Validation and Payment Logic)
// =======================================================

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function renderCheckoutSummary() {
    if (getCurrentPage() !== 'checkout') return;
    
    const summaryItems = document.getElementById('summary-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const payBtnText = document.getElementById('pay-btn-text');
    
    let total = 0;
    summaryItems.innerHTML = '';

    if (cart.length === 0) {
        summaryItems.innerHTML = '<p>കാർട്ടിൽ പുസ്തകങ്ങൾ ഇല്ല.</p>';
        totalAmountSpan.innerText = `₹0`;
        if (payBtnText) payBtnText.parentNode.disabled = true;
        return;
    } 

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        summaryItems.innerHTML += `
            <div class="summary-line">
                <span>${item.title} (x${item.quantity})</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    });

    totalAmountSpan.innerText = `₹${total}`;
    if (payBtnText) payBtnText.innerText = `₹${total} അടയ്ക്കുക`;
    if (payBtnText) payBtnText.parentNode.disabled = false;
}

function processPayment() {
    if (getCurrentPage() !== 'checkout') return;

    const address = document.getElementById('address').value.trim();
    const pincode = document.getElementById('pincode').value.trim();
    let isValid = true;

    // Validation
    const addressError = document.getElementById('address-error');
    const pincodeError = document.getElementById('pincode-error');

    if (address.length < 10) {
        addressError.innerText = "ദയവായി പൂർണ്ണമായ വിലാസം നൽകുക.";
        addressError.style.display = 'block';
        isValid = false;
    } else {
        addressError.style.display = 'none';
    }

    if (pincode.length !== 6 || isNaN(pincode)) {
        pincodeError.innerText = "ദയവായി 6 അക്ക പിൻ കോഡ് നൽകുക.";
        pincodeError.style.display = 'block';
        isValid = false;
    } else {
        pincodeError.style.display = 'none';
    }

    if (isValid) {
        // Clear cart after successful order
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show thank you screen
        document.getElementById('checkout-screen').style.display = 'none';
        document.getElementById('thank-you-screen').style.display = 'flex';
        window.scrollTo(0, 0); // Scroll to top
    }
}

function handleCheckoutInit() {
    if (getCurrentPage() !== 'checkout') return;
    
    // Redirect if cart is empty (optional)
    if (cart.length === 0) {
        // window.location.href = 'home.html';
        // return;
    }
    
    // Initial display setup
    document.getElementById('checkout-screen').style.display = 'flex';
    document.getElementById('thank-you-screen').style.display = 'none';
    renderCheckoutSummary();
}