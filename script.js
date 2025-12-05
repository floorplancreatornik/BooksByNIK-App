// =========================================================
// 1. CONFIGURATION: YOUR DEPLOYED APP SCRIPT URL
// =========================================================
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfutlqgo1z76Upfct07p6brPJEfYZUiNii7T445cIu6mavWHG7T9cltAvTPLqTOt6eyQ/exec";

// =========================================================
let currentLang = 'en';

let cartItemCount = 0;

let cartDetails = {
    bookTitle: "ഹൃദയത്തിന്റെ മന്ത്രണങ്ങൾ",
    bookCode: "WOH001",
    price: 299,
    quantity: 1,
    total: 299
};
// --- Translations Map (Partial - Only required elements) ---
const translations = {
    'en': {
        'main-title': 'Welcome to BooksByNIK V8', // Keep V8 for now to ensure index.html update
        'sub-title': 'Discover premium books directly from the author',
        'name-label': 'Your Name',
        'phone-label': 'Phone Number',
        'continue-btn': 'Continue',
        // Navigation (data-ml attribute)
        'ഹോം': 'Home', 'കാർട്ട്': 'Cart', 'പ്രൊഫൈൽ': 'Profile'
    },
    'ml': {
        'main-title': 'BooksByNIK-ലേക്ക് സ്വാഗതം V8', // Keep V8 for now to ensure index.html update
        'sub-title': 'എഴുത്തുകാരനിൽ നിന്ന് നേരിട്ട് പ്രീമിയം പുസ്തകങ്ങൾ കണ്ടെത്തുക',
        'name-label': 'നിങ്ങളുടെ പേര്',
        'phone-label': 'ഫോൺ നമ്പർ',
        'continue-btn': 'തുടരുക',
        'ഹോം': 'ഹോം', 'കാർട്ട്': 'കാർട്ട്', 'പ്രൊഫൈൽ': 'പ്രൊഫൈൽ'
    }
};
// --- API Functions (Connects to your Google Sheet) ---
async function sendDataToAppScript(data) {
    console.log(`Sending data (type: ${data.type}) to App Script...`);
    try {
        const response = await fetch(APP_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for App Script deployment (prevents CORS errors)
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            redirect: 'follow',
            body: JSON.stringify(data)
        });
        // Since mode: 'no-cors' is used, response.ok status cannot be read reliably.
        console.log(`Data sent successfully to Sheet: ${data.type}`);
        return { result: "success" };
    } catch (error) {
        console.error("Error submitting data:", error);
        return { result: "error", message: error.toString() };
    }
}
// --- Core Navigation and UI Functions ---
function showScreen(screenId, navElement = null) {
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.style.display = 'none';
    });

    document.getElementById(screenId).style.display = 'flex'; // Use flex for login screen centering
    if (screenId !== 'login-screen') {
        document.getElementById(screenId).style.display = 'block'; // Use block for scrolling screens
    }

    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Set Active Nav Item
    if (navElement) {
        navElement.classList.add('active');
    } else if (screenId !== 'login-screen' && screenId !== 'thank-you-screen') {
        // Handle navigation from internal buttons (like back/continue)
        const targetNav = document.querySelector(`.nav-item[data-target="${screenId.replace('-screen', '')}"]`);
        if (targetNav) targetNav.classList.add('active');
    }

    // Hide Bottom Nav for screens without it
    const bottomNav = document.querySelector('.bottom-nav');
    if (screenId === 'login-screen' || screenId === 'checkout-screen' || screenId === 'thank-you-screen') {
        bottomNav.style.display = 'none';
    } else {
        bottomNav.style.display = 'flex';
    }


    if (screenId === 'cart-screen') updateCartScreen();
    if (screenId === 'checkout-screen') prefillCheckout();
}

function updateLanguage(lang) {
    currentLang = lang;
    
    // Update main titles
    const keys = ['main-title', 'sub-title', 'name-label', 'phone-label', 'continue-btn'];
    keys.forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update bottom nav and other ML elements
    document.querySelectorAll('.nav-item span[data-ml]').forEach(span => {
        const mlText = span.getAttribute('data-ml');
        if (translations[lang][mlText]) {
            span.textContent = translations[lang][mlText];
        }
    });
    // Update language button active state
    document.getElementById('lang-en').classList.remove('active');
    document.getElementById('lang-ml').classList.remove('active');
    document.getElementById(`lang-${lang}`).classList.add('active');
}

function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    cartItemCount = cartDetails.quantity;
    if (cartItemCount > 0) {
        badge.textContent = cartItemCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function addToCart() {
    cartDetails.quantity = 1;
    cartDetails.total = cartDetails.price * cartDetails.quantity;
    updateCartBadge();
    
    const button = document.getElementById('add-to-cart-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '✅ കാർട്ടിൽ ചേർത്തു';
    button.disabled = true;

    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1500);
}

function updateQty(change) {
    let newQty = cartDetails.quantity + change;
    if (newQty >= 1) {
        cartDetails.quantity = newQty;
    } else {
        removeFromCart();
        return;
    }
    cartDetails.total = cartDetails.price * cartDetails.quantity;
    
    // Update UI elements
    document.getElementById('item-quantity').textContent = cartDetails.quantity;
    document.getElementById('total-amount').textContent = `₹${cartDetails.total}`;
    updateCartBadge();
}

function removeFromCart() {
    cartDetails.quantity = 0;
    cartDetails.total = 0;
    updateCartBadge();
    updateCartScreen();
}

function updateCartScreen() {
    const emptyState = document.getElementById('cart-empty-state');
    const filledState = document.getElementById('cart-filled-state');
    if (cartDetails.quantity > 0) {
        // Update filled cart details
        document.getElementById('item-quantity').textContent = cartDetails.quantity;
        document.getElementById('total-amount').textContent = `₹${cartDetails.total}`;
        
        emptyState.style.display = 'none';
        filledState.style.display = 'block';
    } else {
        emptyState.style.display = 'block';
        filledState.style.display = 'none';
    }
}

function buyNow() {
    cartDetails.quantity = 1;
    cartDetails.total = cartDetails.price * cartDetails.quantity;
    updateCartBadge();
    showScreen('checkout-screen');
}

function prefillCheckout() {
    const savedName = localStorage.getItem('userName') || 'Floor Plan Creator';
    const savedPhone = localStorage.getItem('userPhone') || '+91 9876543210';

    document.getElementById('checkout-name').value = savedName;
    document.getElementById('checkout-phone').value = savedPhone;
    
    // Update summary
    document.getElementById('checkout-qty').textContent = cartDetails.quantity;
    document.getElementById('checkout-price').textContent = `₹${cartDetails.price}`;
    document.getElementById('checkout-total-price').textContent = `₹${cartDetails.total}`;
}

// =========================================================
// !!! CRITICAL MISSING FUNCTIONS ADDED HERE !!!
// =========================================================

function showBookDetails(title, price, category, bookCode) {
    // 1. Update the cart details object with the selected book
    cartDetails.bookTitle = title;
    cartDetails.bookCode = bookCode;
    cartDetails.price = price;
    
    // 2. Populate the Detail Screen's elements
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-category').textContent = category;
    document.getElementById('detail-price').textContent = `₹${price}`;
    
    // 3. Set the image sources
    const mainCover = document.getElementById('main-book-cover');
    // Using the placeholder-main image from the HTML structure
    mainCover.src = `images/placeholder-main.png`; 

    // 4. Reset thumbnail selection
    document.querySelectorAll('.preview-thumbnails .thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    // The first thumbnail should be marked active
    document.querySelector('.preview-thumbnails .thumbnail').classList.add('active');

    // 5. Navigate to the screen
    showScreen('book-details-screen');
}

function swapImage(thumbnail) {
    const mainCover = document.getElementById('main-book-cover');
    const newSrc = thumbnail.getAttribute('data-full-src');
    
    // Update main image source
    mainCover.src = newSrc;
    
    // Update active class on thumbnails
    document.querySelectorAll('.preview-thumbnails .thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnail.classList.add('active');
}

// =========================================================
// --- Event Listeners and Validation ---
// =========================================================

// Login screen validation and App Script log (type: user_login)
document.getElementById('continue-btn').addEventListener('click', async () => {
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const phoneGroup = document.getElementById('phone-input-group');
    let isValid = true;

    nameInput.classList.remove('error');
    phoneGroup.classList.remove('error');

    if (nameInput.value.trim() === '') {
        nameInput.classList.add('error');
        isValid = false;
    }

    const phoneValue = phoneInput.value.trim();
    if (phoneValue.length !== 10 || isNaN(phoneValue)) {
        phoneGroup.classList.add('error');
        isValid = false;
    }
    if (isValid) {
        // 1. Prepare data for the App Script (type: user_login)
        const loginData = {
            type: 'user_login', 
            name: nameInput.value.trim(),
            phone: '+91 ' + phoneValue, // Sending full phone number
            language: currentLang 
        };
        
        // 2. Send Data to Google Sheet (Async)
        await sendDataToAppScript(loginData);
        
        // 3. Save details locally and navigate
        localStorage.setItem('userName', nameInput.value.trim());
        localStorage.setItem('userPhone', '+91 ' + phoneValue);
        
        // Correctly set the home screen as active in the nav bar
        const homeNav = document.querySelector('.nav-item[data-target="home"]');
        showScreen('home-screen', homeNav);
    }
});
// Checkout screen validation and Payment Initiation (type: checkout)
document.getElementById('pay-now-btn').addEventListener('click', async () => {
    const addressInput = document.getElementById('full-address');
    const pincodeInput = document.getElementById('pincode');
    const addressError = document.getElementById('address-error');
    const pincodeError = document.getElementById('pincode-error');
    let isValid = true;

    addressInput.classList.remove('error');
    pincodeInput.classList.remove('error');
    addressError.style.display = 'none';
    pincodeError.style.display = 'none';

    if (addressInput.value.trim() === '') {
        addressInput.classList.add('error');
        addressError.style.display = 'block';
        isValid = false;
    }

    const pincodeValue = pincodeInput.value.trim();
    if (pincodeValue.length !== 6 || isNaN(pincodeValue)) {
        pincodeInput.classList.add('error');
        pincodeError.style.display = 'block';
        isValid = false;
    }
    if (isValid) {
        // Data for App Script and Payment Notes
        const fullName = document.getElementById('checkout-name').value.trim();
        const phoneNumber = document.getElementById('checkout-phone').value.trim();
        const address = addressInput.value.trim();
        const pincode = pincodeInput.value.trim();
        
        // Format Payment Notes (bookcode|pincode|phonenumber|full name)
        const paymentNote = `${cartDetails.bookCode}|${pincode}|${phoneNumber.replace('+91 ', '')}|${fullName.replace(/\s/g, ' ')}`;

        // 1. Prepare data for App Script (type: checkout)
        const checkoutData = {
            type: 'checkout', 
            fullName: fullName, 
            phoneNumber: phoneNumber, 
            address: address, 
            pincode: pincode, 
            bookCode: cartDetails.bookCode, 
            total: cartDetails.total, 
            paymentNote: paymentNote
        };
        
        // 2. Save Checkout Data to Google Sheet (Async)
        await sendDataToAppScript(checkoutData);

        // 3. Simulate Payment Gateway Redirect and navigate
        console.log(`Simulating UPI redirect with Notes: ${paymentNote}`);
        
        showScreen('thank-you-screen');
    } else {
        if (addressInput.classList.contains('error')) {
            addressInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (pincodeInput.classList.contains('error')) {
             pincodeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});
// --- Initialization ---
// Dark Mode Toggle
document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const body = document.body;
        body.classList.toggle('dark-theme');
        const icon = btn.textContent;
        btn.textContent = icon === '🌙' ? '☀️' : '🌙';
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // Initial state setup
    showScreen('login-screen');
    updateCartBadge(); 
    
    // Language event listeners
    document.getElementById('lang-en').addEventListener('click', () => updateLanguage('en'));
    document.getElementById('lang-ml').addEventListener('click', () => updateLanguage('ml'));
    updateLanguage('en'); 
});