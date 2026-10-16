// Global BookStore Shared Logic (localStorage Cart & Orders for Static GitHub Pages)
const CART_KEY = 'bookstore_static_cart';
const ORDERS_KEY = 'bookstore_static_orders';

const ALL_BOOKS = [
    { id: "650000000000000000000001", numId: "1", title: "Atomic Habits", author: "James Clear", price: 499, originalPrice: 650, category: "Self learning", rating: 4.9, reviews: 2400, image: "img1.png", discount: "23% OFF" },
    { id: "650000000000000000000002", numId: "2", title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", price: 399, originalPrice: 550, category: "Self learning", rating: 4.8, reviews: 1850, image: "img2.jpg", discount: "27% OFF" },
    { id: "650000000000000000000003", numId: "3", title: "The Hobbit", author: "J.R.R. Tolkien", price: 599, originalPrice: 799, category: "Fantasy", rating: 4.9, reviews: 3100, image: "img3.png", discount: "25% OFF" },
    { id: "650000000000000000000004", numId: "4", title: "The Psychology of Money", author: "Morgan Housel", price: 450, originalPrice: 600, category: "Self learning", rating: 4.9, reviews: 1950, image: "img4.png", discount: "25% OFF" },
    { id: "650000000000000000000005", numId: "5", title: "Think and Grow Rich", author: "Napoleon Hill", price: 350, originalPrice: 500, category: "Self learning", rating: 4.7, reviews: 1420, image: "img5.png", discount: "30% OFF" },
    { id: "650000000000000000000006", numId: "6", title: "The Alchemist", author: "Paulo Coelho", price: 299, originalPrice: 450, category: "Fiction", rating: 4.8, reviews: 4200, image: "img6.png", discount: "33% OFF" },
    { id: "650000000000000000000007", numId: "7", title: "Harry Potter & Sorcerer's Stone", author: "J.K. Rowling", price: 699, originalPrice: 899, category: "Fantasy", rating: 5.0, reviews: 5800, image: "img7.png", discount: "22% OFF" },
    { id: "650000000000000000000008", numId: "8", title: "To Kill a Mockingbird", author: "Harper Lee", price: 399, originalPrice: 520, category: "Classic", rating: 4.8, reviews: 2100, image: "img8.png", discount: "23% OFF" },
    { id: "650000000000000000000009", numId: "9", title: "Sapiens: A Brief History", author: "Yuval Noah Harari", price: 599, originalPrice: 850, category: "History", rating: 4.9, reviews: 3400, image: "img9.png", discount: "29% OFF" },
    { id: "650000000000000000000010", numId: "10", title: "Clean Code", author: "Robert C. Martin", price: 899, originalPrice: 1200, category: "Technology", rating: 4.9, reviews: 1750, image: "img10.png", discount: "25% OFF" },
    { id: "650000000000000000000011", numId: "11", title: "Ikigai: Japanese Secret", author: "Héctor García", price: 420, originalPrice: 550, category: "Self learning", rating: 4.7, reviews: 1600, image: "img11.png", discount: "24% OFF" },
    { id: "650000000000000000000012", numId: "12", title: "The Power of Habit", author: "Charles Duhigg", price: 480, originalPrice: 650, category: "Self learning", rating: 4.8, reviews: 2200, image: "img12.png", discount: "26% OFF" }
];

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateNavCartBadge();
    if (window.location.pathname.endsWith('cart.html') || window.location.pathname.endsWith('cart')) {
        renderCartPage();
    }
}

function getOrders() {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [
            {
                orderId: 'ORD-892415',
                fullName: 'Tejaswi Sen',
                phone: '+91 987456321',
                address: 'B-12, Sector 15, Connaught Place, New Delhi',
                paymentMethod: 'Cash on Delivery',
                createdAt: 'Today',
                status: 'Processing',
                statusStep: 2,
                totalAmount: 499,
                items: [
                    { title: 'Atomic Habits', price: 499, quantity: 1, image: 'img1.png' }
                ]
            }
        ];
    } catch (e) {
        return [];
    }
}

function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function updateNavCartBadge() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    
    // Look for cart link in navbar
    const cartLinks = document.querySelectorAll('a[href*="cart.html"], a[href="/cart"]');
    cartLinks.forEach(link => {
        let badge = link.querySelector('.nav-cart-badge-dynamic');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'nav-cart-badge-dynamic ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-black leading-none text-white bg-indigo-500 rounded-full shadow-sm animate-pulse';
            link.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });
}

function showToast(title, message, actionUrl, actionText) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `
        <div class="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/95 text-white border border-indigo-500/30 shadow-2xl backdrop-blur-xl pointer-events-auto">
            <span class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">✓</span>
            <div>
                <p class="text-xs font-bold text-white">${title}</p>
                <p class="text-[11px] text-slate-300">${message}</p>
            </div>
            ${actionUrl ? `<a href="${actionUrl}" class="ml-2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition whitespace-nowrap">${actionText || 'View →'}</a>` : ''}
        </div>
    `;

    toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
    }, 3500);
}

function findBookByRef(ref) {
    if (!ref) return ALL_BOOKS[0];
    const decoded = decodeURIComponent(ref).trim().toLowerCase();
    return ALL_BOOKS.find(b => 
        String(b.id).toLowerCase() === decoded || 
        String(b.numId).toLowerCase() === decoded || 
        b.title.toLowerCase() === decoded
    ) || ALL_BOOKS[0];
}

function addToCartByRef(ref, redirect) {
    const book = findBookByRef(ref);
    if (!book) return;

    let cart = getCart();
    const existing = cart.find(item => item.id === book.id || item.title === book.title);
    if (existing) {
        existing.quantity = (Number(existing.quantity) || 1) + 1;
    } else {
        cart.push({
            id: book.id,
            title: book.title,
            price: book.price,
            image: book.image,
            category: book.category,
            quantity: 1
        });
    }
    saveCart(cart);

    if (redirect) {
        window.location.href = 'cart.html';
    } else {
        showToast('Added to Cart! 🛒', `"${book.title}" added to your basket.`, 'cart.html', 'Go to Cart');
    }
}

// Global Click Interceptor for Links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';

    if (href.includes('/books/add-to-cart/')) {
        e.preventDefault();
        const parts = href.split('/books/add-to-cart/');
        const ref = parts[1] || '';
        addToCartByRef(ref, false);
    } else if (href.includes('/books/buy/')) {
        e.preventDefault();
        const parts = href.split('/books/buy/');
        const ref = parts[1] || '';
        addToCartByRef(ref, true);
    }
});

// Category pills on category.html
function initCategoryFiltering() {
    const pills = document.querySelectorAll('a[href*="/category/"], a[href="category.html"]');
    const cards = document.querySelectorAll('.grid > div');
    if (pills.length === 0 || cards.length === 0) return;

    pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            const href = pill.getAttribute('href') || '';
            if (href.includes('/category/')) {
                e.preventDefault();
                const catName = decodeURIComponent(href.split('/category/')[1] || '').toLowerCase().trim();
                
                pills.forEach(p => {
                    p.classList.remove('bg-indigo-600', 'text-white', 'scale-105');
                    p.classList.add('bg-gray-100', 'text-gray-700');
                });
                pill.classList.remove('bg-gray-100', 'text-gray-700');
                pill.classList.add('bg-indigo-600', 'text-white', 'scale-105');

                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    if (text.includes(catName)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            } else if (href === 'category.html') {
                e.preventDefault();
                pills.forEach(p => {
                    p.classList.remove('bg-indigo-600', 'text-white', 'scale-105');
                    p.classList.add('bg-gray-100', 'text-gray-700');
                });
                pill.classList.remove('bg-gray-100', 'text-gray-700');
                pill.classList.add('bg-indigo-600', 'text-white', 'scale-105');
                cards.forEach(card => card.style.display = 'flex');
            }
        });
    });
}

// Render dynamic cart on cart.html
function renderCartPage() {
    const main = document.querySelector('main');
    if (!main) return;

    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);

    if (cart.length === 0) {
        main.innerHTML = `
            <div class="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-16 text-center max-w-2xl mx-auto my-8">
                <div class="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-4xl shadow-inner mb-6">
                    📚
                </div>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Your Shopping Cart is Empty
                </h2>
                <p class="text-gray-500 mt-3 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                    Looks like you haven't added any books to your cart yet. Discover bestselling literature, self-growth guides, and fiction classics.
                </p>
                <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="books.html" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg shadow-indigo-500/25 transition transform active:scale-95 text-sm sm:text-base">
                        <span>Explore All Books</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </a>
                    <a href="category.html" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition">
                        <span>Browse Categories</span>
                    </a>
                </div>
            </div>
        `;
        return;
    }

    main.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
            <!-- Items Column -->
            <div class="lg:col-span-8 space-y-4">
                <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl">
                    <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                        <h3 class="text-lg font-bold text-gray-900">Items in Your Basket (${count})</h3>
                        <button onclick="localStorage.removeItem('${CART_KEY}'); renderCartPage(); updateNavCartBadge();" class="text-xs text-rose-500 hover:text-rose-700 font-bold underline cursor-pointer">Clear Basket</button>
                    </div>

                    <div class="space-y-4">
                        ${cart.map((item, idx) => `
                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                                <div class="flex items-center gap-4">
                                    <img src="./${item.image}" alt="${item.title}" class="w-16 h-20 object-contain rounded-xl bg-white p-1 border border-gray-200 shadow-xs" onerror="this.src='./img1.png'">
                                    <div>
                                        <h4 class="font-bold text-gray-900 text-base">${item.title}</h4>
                                        <p class="text-xs text-indigo-600 font-semibold">${item.category || 'Curated Book'}</p>
                                        <p class="text-sm font-extrabold text-gray-800 mt-1">₹${item.price} each</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                                        <button onclick="changeCartQty(${idx}, -1)" class="px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100">-</button>
                                        <span class="px-4 py-1.5 text-sm font-extrabold text-gray-900 bg-gray-50">${item.quantity}</span>
                                        <button onclick="changeCartQty(${idx}, 1)" class="px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100">+</button>
                                    </div>
                                    <span class="text-base font-black text-indigo-600 min-w-[70px] text-right">₹${item.price * item.quantity}</span>
                                    <button onclick="removeCartItem(${idx})" class="text-slate-400 hover:text-rose-500 font-bold text-lg cursor-pointer px-1">✕</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Summary Column -->
            <div class="lg:col-span-4 space-y-6">
                <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-5">
                    <h3 class="text-lg font-bold text-gray-900">Order Summary</h3>
                    
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span class="font-bold text-gray-900">₹${subtotal}</span>
                        </div>
                        <div class="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span class="font-bold text-emerald-600">${subtotal >= 499 ? 'FREE' : '₹50'}</span>
                        </div>
                        <div class="pt-3 border-t border-gray-100 flex justify-between text-lg font-black text-gray-900">
                            <span>Total Payable</span>
                            <span class="text-indigo-600">₹${subtotal >= 499 ? subtotal : subtotal + 50}</span>
                        </div>
                    </div>

                    <button onclick="document.getElementById('checkout-modal').classList.remove('hidden')" class="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-base shadow-lg shadow-indigo-600/25 active:scale-95 transition cursor-pointer">
                        Proceed to Checkout →
                    </button>
                </div>
            </div>
        </div>
    `;

    // Hook checkout form
    const checkoutForm = document.querySelector('#checkout-modal form');
    if (checkoutForm) {
        checkoutForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('name')?.value || 'Customer';
            const phone = document.getElementById('phone')?.value || '+91 987456321';
            const address = document.getElementById('address')?.value || 'Standard Address';

            const orders = getOrders();
            const newOrder = {
                orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
                fullName: name,
                phone: phone,
                address: address,
                createdAt: 'Today',
                status: 'Order Placed',
                statusStep: 1,
                totalAmount: subtotal >= 499 ? subtotal : subtotal + 50,
                items: cart
            };

            orders.unshift(newOrder);
            saveOrders(orders);
            saveCart([]);
            window.location.href = 'orders.html';
        };
    }
}

function changeCartQty(idx, delta) {
    let cart = getCart();
    if (cart[idx]) {
        cart[idx].quantity = (Number(cart[idx].quantity) || 1) + delta;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
        saveCart(cart);
    }
}

function removeCartItem(idx) {
    let cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
}

// Render dynamic orders on orders.html
function renderOrdersPage() {
    const main = document.querySelector('main');
    if (!main) return;

    const orders = getOrders();
    if (orders.length === 0) {
        main.innerHTML = `
            <div class="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-xl mx-auto shadow-xl">
                <div class="text-4xl mb-3">📦</div>
                <h3 class="text-xl font-bold text-gray-900">No Orders Placed Yet</h3>
                <p class="text-xs text-gray-500 mt-2">Browse our catalog and order your first favorite book!</p>
                <a href="books.html" class="inline-block mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700">Explore Books</a>
            </div>
        `;
        return;
    }

    main.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            ${orders.map(order => `
                <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-5">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                        <div>
                            <div class="flex items-center gap-3">
                                <span class="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs">${order.orderId}</span>
                                <span class="text-xs text-gray-400">Placed on ${order.createdAt}</span>
                            </div>
                            <p class="text-xs text-gray-600 mt-1">Recipient: <span class="font-bold text-gray-900">${order.fullName}</span> (${order.phone})</p>
                        </div>
                        <div class="text-right">
                            <span class="text-xl font-black text-indigo-600">₹${order.totalAmount}</span>
                            <span class="block text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">${order.status}</span>
                        </div>
                    </div>

                    <!-- Progress bar -->
                    <div class="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                        <div class="p-2 rounded-xl ${order.statusStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}">1. Placed</div>
                        <div class="p-2 rounded-xl ${order.statusStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}">2. Packed</div>
                        <div class="p-2 rounded-xl ${order.statusStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}">3. Shipped</div>
                        <div class="p-2 rounded-xl ${order.statusStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}">4. Delivered</div>
                    </div>

                    <!-- Ordered Items -->
                    <div class="space-y-3 pt-2">
                        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</h4>
                        <div class="space-y-2">
                            ${order.items.map(item => `
                                <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                                    <div class="flex items-center gap-3">
                                        <img src="./${item.image || 'img1.png'}" alt="${item.title}" class="w-10 h-12 object-contain rounded bg-white p-1 border border-gray-200" onerror="this.src='./img1.png'">
                                        <div>
                                            <p class="font-bold text-gray-900">${item.title}</p>
                                            <p class="text-gray-500">Qty: ${item.quantity} × ₹${item.price}</p>
                                        </div>
                                    </div>
                                    <span class="font-extrabold text-gray-900">₹${item.price * item.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavCartBadge();
    initCategoryFiltering();

    const path = window.location.pathname;
    if (path.endsWith('cart.html') || path.endsWith('cart')) {
        renderCartPage();
    } else if (path.endsWith('orders.html') || path.endsWith('orders')) {
        renderOrdersPage();
    }
});
