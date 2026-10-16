const dns = require("dns");
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (_) {}

const path = require("path");
const fs = require("fs");

// Load .env variables
const loadEnv = () => {
    const envPaths = [
        path.join(__dirname, '.env'),
        path.join(__dirname, '..', '.env'),
        path.join(process.cwd(), '.env')
    ];
    for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
            try {
                const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        const eqIdx = trimmed.indexOf('=');
                        if (eqIdx > 0) {
                            const key = trimmed.slice(0, eqIdx).trim();
                            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
                            if (!process.env[key]) {
                                process.env[key] = val;
                            }
                        }
                    }
                }
            } catch (_) {}
            break;
        }
    }
};
loadEnv();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

async function main() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookstore';
    try {
        await mongoose.connect(mongoUri, {
            dbName: 'bookstore',
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 8000
        });
        console.log('MongoDB Connected successfully to:', mongoUri.includes('@') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
        await seedDefaultBooks();
    } catch (err) {
        console.error('MongoDB Atlas connection failed:', err.message);
        console.log('NOTE: Please whitelist your IP in MongoDB Atlas Network Access (0.0.0.0/0).');
        try {
            console.log('Trying local MongoDB fallback (mongodb://127.0.0.1:27017/bookstore)...');
            await mongoose.connect('mongodb://127.0.0.1:27017/bookstore', {
                serverSelectionTimeoutMS: 2000
            });
            console.log('Connected to Local MongoDB fallback!');
            await seedDefaultBooks();
        } catch (localErr) {
            console.log('Running in fast in-memory mode with default books.');
        }
    }
}

const bookSchema = new mongoose.Schema({
    name: String,
    title: String,
    author: String,
    price: Number,
    category: String,
    image: String
});

const Book = mongoose.model('Book', bookSchema);

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        default: () => 'ORD-' + Math.floor(100000 + Math.random() * 900000)
    },
    fullName: { type: String, default: 'Customer' },
    phone: { type: String, default: '+91 987456321' },
    pincode: { type: String, default: '110001' },
    address: { type: String, default: 'Standard Delivery Address' },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    paymentStatus: { type: String, default: 'Payment Successful' },
    orderStatus: { type: String, default: 'Processing' }, // 'Order Placed', 'Processing', 'Shipped', 'Delivered'
    statusStep: { type: Number, default: 2 }, // 1: Order Placed, 2: Processing, 3: Shipped, 4: Delivered
    items: [
        {
            name: String,
            title: String,
            price: Number,
            quantity: Number,
            image: String
        }
    ],
    totalAmount: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    message: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ContactMessage = mongoose.model('ContactMessage', contactSchema);

const defaultBooks = [
    {
        _id: "650000000000000000000001",
        name: "Atomic Habits",
        title: "Atomic Habits",
        author: "James Clear",
        price: 499,
        category: "Self learning",
        image: "img1.png"
    },
    {
        _id: "650000000000000000000002",
        name: "Rich Dad Poor Dad",
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        price: 399,
        category: "Self learning",
        image: "img2.jpg"
    },
    {
        _id: "650000000000000000000003",
        name: "The Hobbit",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        price: 599,
        category: "Fantasy",
        image: "img3.png"
    },
    {
        _id: "650000000000000000000004",
        name: "The Psychology of Money",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        price: 450,
        category: "Self learning",
        image: "img4.png"
    },
    {
        _id: "650000000000000000000005",
        name: "Think and Grow Rich",
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        price: 350,
        category: "Self learning",
        image: "img5.png"
    },
    {
        _id: "650000000000000000000006",
        name: "The Alchemist",
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 299,
        category: "Fiction",
        image: "img6.png"
    },
    {
        _id: "650000000000000000000007",
        name: "Harry Potter & Sorcerer's Stone",
        title: "Harry Potter & Sorcerer's Stone",
        author: "J.K. Rowling",
        price: 699,
        category: "Fantasy",
        image: "img7.png"
    },
    {
        _id: "650000000000000000000008",
        name: "To Kill a Mockingbird",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        price: 399,
        category: "Classic",
        image: "img8.png"
    },
    {
        _id: "650000000000000000000009",
        name: "Sapiens: A Brief History",
        title: "Sapiens: A Brief History",
        author: "Yuval Noah Harari",
        price: 599,
        category: "History",
        image: "img9.png"
    },
    {
        _id: "650000000000000000000010",
        name: "Clean Code",
        title: "Clean Code",
        author: "Robert C. Martin",
        price: 899,
        category: "Technology",
        image: "img10.png"
    },
    {
        _id: "650000000000000000000011",
        name: "Ikigai: Japanese Secret",
        title: "Ikigai: Japanese Secret",
        author: "Héctor García",
        price: 420,
        category: "Self learning",
        image: "img11.png"
    },
    {
        _id: "650000000000000000000012",
        name: "The Power of Habit",
        title: "The Power of Habit",
        author: "Charles Duhigg",
        price: 480,
        category: "Self learning",
        image: "img12.png"
    }
];

async function seedDefaultBooks() {
    try {
        if (mongoose.connection.readyState === 1) {
            const count = await Book.countDocuments().maxTimeMS(3000);
            if (count === 0) {
                await Book.insertMany(defaultBooks);
                console.log(`Auto-seeded ${defaultBooks.length} books into MongoDB bookstore database.`);
            }

            const orderCount = await Order.countDocuments().maxTimeMS(3000);
            if (orderCount === 0) {
                const initialOrder = new Order({
                    orderId: 'ORD-892415',
                    fullName: 'Tejaswi Reader',
                    phone: '+91 987456321',
                    pincode: '110001',
                    address: 'B-12, Sector 15, Connaught Place, New Delhi',
                    paymentMethod: 'Cash on Delivery',
                    paymentStatus: 'Payment Successful',
                    orderStatus: 'Processing',
                    statusStep: 2,
                    items: [
                        {
                            name: 'Atomic Habits',
                            title: 'Atomic Habits',
                            price: 499,
                            quantity: 1,
                            image: 'img1.png'
                        }
                    ],
                    totalAmount: 499,
                    createdAt: new Date()
                });
                await initialOrder.save();
                console.log('Auto-seeded initial order into MongoDB orders collection.');
            }
        }
    } catch (err) {
        console.error('Error during auto-seeding:', err.message);
    }
}

const getBooksFast = async () => {
    if (mongoose.connection.readyState === 1) {
        try {
            const dbBooks = await Book.find().maxTimeMS(2000).lean();
            if (dbBooks && dbBooks.length > 0) return dbBooks;
        } catch (e) {
            console.error('Fast books fetch fallback:', e.message);
        }
    }
    return defaultBooks;
};

main().catch((err) => { console.log('Main DB Init error:', err.message); });
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.locals.cart = [];

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    pool: true,
    maxConnections: 2,
    maxMessages: 20,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.get('/', async (req, res) => {
    try {
        const books = await getBooksFast();
        res.render('home', { books });
    } catch (err) {
        console.error('Error in home route:', err);
        res.render('home', { books: defaultBooks });
    }
});
app.get('/about',(req,res)=>{
    res.render('about')
})
function addCartItem(book) {
    const cartItems = app.locals.cart || [];
    const bookId = book._id ? book._id.toString() : String(book.name || book.title);
    const existingItem = cartItems.find(item => (item._id ? item._id.toString() : String(item.name || item.title)) === bookId);

    if (existingItem) {
        existingItem.quantity = (Number(existingItem.quantity) || 1) + 1;
    } else {
        const itemObj = (typeof book.toObject === 'function') ? book.toObject() : { ...book };
        cartItems.push({ ...itemObj, quantity: 1 });
    }

    app.locals.cart = cartItems;
    return cartItems;
}

app.get('/books', async (req, res) => {
    try {
        const books = await getBooksFast();
        res.render('books', { books, added: req.query.added || null });
    } catch (err) {
        console.error('Error in /books route:', err);
        res.render('books', { books: defaultBooks, added: null });
    }
});

// Add New Book Route
app.post('/books/add', async (req, res) => {
    try {
        const { name, title, author, price, category, image } = req.body;
        const newBook = new Book({
            name: name || title || 'Untitled Book',
            title: title || name || 'Untitled Book',
            author: author || 'Unknown Author',
            price: Number(price) || 299,
            category: category || 'General',
            image: image || 'img1.png'
        });
        await newBook.save();
        res.redirect('/books?added=1');
    } catch (err) {
        console.error('Error adding book:', err);
        res.redirect('/books');
    }
});

// Buy Now Route: Adds book to cart and immediately redirects to Cart for checkout
// Supports /books/buy, /books/buy/, /books/buy/:id, /books/buy-now, /books/buy-now/, /books/buy-now/:id
app.get(['/books/buy', '/books/buy/', '/books/buy/:id', '/books/buy-now', '/books/buy-now/', '/books/buy-now/:id'], async (req, res) => {
    try {
        const id = (req.params.id || req.query.id || '').trim();
        let book = null;

        if (id && id !== 'undefined' && id !== 'null') {
            const decoded = decodeURIComponent(id).trim().toLowerCase();

            // 1. Instant check in memory (0ms)
            book = defaultBooks.find(b => 
                (b._id && String(b._id) === id) || 
                (b.name && b.name.toLowerCase() === decoded) || 
                (b.title && b.title.toLowerCase() === decoded) || 
                (b.image && b.image.toLowerCase() === decoded)
            );

            // 2. If not found in defaultBooks and DB is connected, check DB
            if (!book && mongoose.connection.readyState === 1) {
                try {
                    if (mongoose.Types.ObjectId.isValid(id)) {
                        book = await Book.findById(id).maxTimeMS(2000).lean();
                    }
                    if (!book) {
                        book = await Book.findOne({
                            $or: [
                                { name: new RegExp('^' + decoded + '$', 'i') },
                                { title: new RegExp('^' + decoded + '$', 'i') }
                            ]
                        }).maxTimeMS(2000).lean();
                    }
                } catch (dbErr) {
                    console.error('DB query error in buy route:', dbErr.message);
                }
            }
        }

        // 3. Fallback
        if (!book) {
            book = defaultBooks[0];
        }

        if (book) {
            addCartItem(book);
        }
        res.redirect('/cart');
    } catch (err) {
        console.error('Error in buy now:', err);
        if (defaultBooks.length > 0) {
            addCartItem(defaultBooks[0]);
        }
        res.redirect('/cart');
    }
});

// Add to Cart Route: Adds book to cart and keeps user on page or redirects
// Supports /books/add-to-cart, /books/add-to-cart/, /books/add-to-cart/:id
app.get(['/books/add-to-cart', '/books/add-to-cart/', '/books/add-to-cart/:id'], async (req, res) => {
    try {
        const id = (req.params.id || req.query.id || '').trim();
        let book = null;

        if (id && id !== 'undefined' && id !== 'null') {
            const decoded = decodeURIComponent(id).trim().toLowerCase();

            // 1. Instant check in memory (0ms)
            book = defaultBooks.find(b => 
                (b._id && String(b._id) === id) || 
                (b.name && b.name.toLowerCase() === decoded) || 
                (b.title && b.title.toLowerCase() === decoded) || 
                (b.image && b.image.toLowerCase() === decoded)
            );

            // 2. If not found in defaultBooks and DB is connected, check DB
            if (!book && mongoose.connection.readyState === 1) {
                try {
                    if (mongoose.Types.ObjectId.isValid(id)) {
                        book = await Book.findById(id).maxTimeMS(2000).lean();
                    }
                    if (!book) {
                        book = await Book.findOne({
                            $or: [
                                { name: new RegExp('^' + decoded + '$', 'i') },
                                { title: new RegExp('^' + decoded + '$', 'i') }
                            ]
                        }).maxTimeMS(2000).lean();
                    }
                } catch (dbErr) {
                    console.error('DB query error in add-to-cart route:', dbErr.message);
                }
            }
        }

        if (!book) {
            book = defaultBooks[0];
        }

        if (book) {
            addCartItem(book);
        }

        if (req.query.redirect === 'cart') {
            return res.redirect('/cart');
        }

        const backUrl = req.get('Referer') || '/books';
        const separator = backUrl.includes('?') ? '&' : '?';
        res.redirect(`${backUrl}${separator}itemAdded=1`);
    } catch (err) {
        console.error('Error in add to cart:', err);
        if (defaultBooks.length > 0) {
            addCartItem(defaultBooks[0]);
        }
        res.redirect('/cart');
    }
});

app.get('/cart', (req, res) => {
    const cartItems = app.locals.cart || [];
    const total = cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0);

    res.render('cart', { cartItems, total });
});

app.get('/cart/remove/:id', (req, res) => {
    const cartItems = app.locals.cart || [];
    app.locals.cart = cartItems.filter(item => String(item._id) !== String(req.params.id));
    res.redirect('/cart');
});

app.get('/cart/decrease/:id', (req, res) => {
    const cartItems = app.locals.cart || [];
    const item = cartItems.find(book => String(book._id) === String(req.params.id));

    if (!item) {
        return res.redirect('/cart');
    }

    if (item.quantity > 1) {
        item.quantity -= 1;
    } else {
        app.locals.cart = cartItems.filter(book => String(book._id) !== String(req.params.id));
    }

    app.locals.cart = cartItems;
    res.redirect('/cart');
});

app.get('/cart/increase/:id', (req, res) => {
    const cartItems = app.locals.cart || [];
    const item = cartItems.find(book => String(book._id) === String(req.params.id));

    if (item) {
        item.quantity = (Number(item.quantity) || 1) + 1;
        app.locals.cart = cartItems;
    }
    res.redirect('/cart');
});

app.get('/cart/clear', (req, res) => {
    app.locals.cart = [];
    res.redirect('/cart');
});

// Process Checkout & Save Order to Database
app.post('/checkout', async (req, res) => {
    try {
        const { fullName, phone, pincode, address, payment } = req.body;
        let cartItems = app.locals.cart || [];
        
        // If cart has no items (e.g. edge case direct call), add default book
        if (cartItems.length === 0) {
            cartItems = [{
                name: 'Atomic Habits',
                title: 'Atomic Habits',
                price: 499,
                quantity: 1,
                image: 'img1.png'
            }];
        }

        const total = cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0);
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        let payMethodText = 'Cash on Delivery';
        if (payment === 'upi') payMethodText = 'UPI / Online';
        else if (payment === 'card') payMethodText = 'Card Payment';

        const orderDoc = {
            orderId: orderId,
            fullName: fullName || 'Tejaswi Reader',
            phone: phone || '+91 987456321',
            pincode: pincode || '110001',
            address: address || 'Main Road, New Delhi',
            paymentMethod: payMethodText,
            paymentStatus: 'Payment Successful',
            orderStatus: 'Processing',
            statusStep: 2, // 1: Order Placed, 2: Processing, 3: Shipped, 4: Delivered
            items: cartItems.map(item => ({
                name: item.name || item.title || 'Book',
                title: item.title || item.name || 'Book',
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                image: item.image || 'img1.png'
            })),
            totalAmount: total,
            createdAt: new Date()
        };

        // 1. Save in memory store so it is immediately accessible even if DB is offline
        app.locals.orders = app.locals.orders || [];
        app.locals.orders.unshift(orderDoc);

        // 2. Save in MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                const newOrder = new Order(orderDoc);
                await newOrder.save();
                console.log('Order successfully saved to MongoDB:', newOrder._id, 'Order ID:', orderId);
            } catch (dbErr) {
                console.error('Order save to DB error:', dbErr.message);
            }
        } else {
            console.log('MongoDB not connected; order saved to in-memory orders store.');
        }

        // Clear cart after placing order
        app.locals.cart = [];

        res.json({ success: true, orderId: orderId, redirectUrl: '/orders' });
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// My Orders Page Route
app.get('/orders', async (req, res) => {
    try {
        let dbOrders = [];
        if (mongoose.connection.readyState === 1) {
            try {
                dbOrders = await Order.find().sort({ createdAt: -1 }).lean().maxTimeMS(3000);
            } catch (err) {
                console.error('Error querying orders from DB:', err.message);
            }
        }

        const memOrders = app.locals.orders || [];

        // Deduplicate between DB and memory by orderId or _id
        const orderMap = new Map();
        for (const ord of dbOrders) {
            const key = ord.orderId || String(ord._id);
            orderMap.set(key, ord);
        }
        for (const ord of memOrders) {
            const key = ord.orderId || String(ord._id);
            if (!orderMap.has(key)) {
                orderMap.set(key, ord);
            }
        }

        let allOrders = Array.from(orderMap.values());
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // If no orders yet, provide an initial showcase order
        if (allOrders.length === 0) {
            const initialOrder = {
                orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
                fullName: 'Tejaswi Reader',
                phone: '+91 987456321',
                pincode: '110001',
                address: 'B-12, Sector 15, Connaught Place, New Delhi',
                paymentMethod: 'Cash on Delivery',
                paymentStatus: 'Payment Successful',
                orderStatus: 'Processing',
                statusStep: 2,
                items: [
                    {
                        name: 'Atomic Habits',
                        title: 'Atomic Habits',
                        price: 499,
                        quantity: 1,
                        image: 'img1.png'
                    }
                ],
                totalAmount: 499,
                createdAt: new Date()
            };
            allOrders.push(initialOrder);
            app.locals.orders = [initialOrder];
        }

        res.render('orders', {
            orders: allOrders,
            cart: app.locals.cart || []
        });
    } catch (err) {
        console.error('Error loading orders page:', err);
        res.render('orders', {
            orders: app.locals.orders || [],
            cart: app.locals.cart || []
        });
    }
});

app.get('/login', (req, res) => {
    res.render('login', {
        error: req.query.error || null,
        redirect: req.query.redirect || '/',
        loggedOut: req.query.logged_out === '1'
    });
});

const VALID_ACCOUNTS = [
    { username: 'tejaswi', email: 'tejaswi@bookstore.com', password: 'password123', name: 'Tejaswi' },
    { username: 'admin', email: 'admin@bookstore.com', password: 'password123', name: 'Admin' }
];

app.post('/login', (req, res) => {
    const { username, password, redirect } = req.body;
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
        return res.render('login', {
            error: 'Please enter both username and password.',
            redirect: redirect || '/',
            enteredUsername: username || ''
        });
    }

    const matchedUser = VALID_ACCOUNTS.find(
        acc => (acc.username.toLowerCase() === cleanUser || acc.email.toLowerCase() === cleanUser) && acc.password === cleanPass
    );

    if (matchedUser) {
        app.locals.user = {
            name: matchedUser.name,
            email: matchedUser.email,
            isLoggedIn: true
        };
        const redirectUrl = redirect || '/';
        const separator = redirectUrl.includes('?') ? '&' : '?';
        res.redirect(`${redirectUrl}${separator}logged_in=1`);
    } else {
        res.render('login', {
            error: 'Incorrect username or password. Please enter the correct credentials.',
            redirect: redirect || '/',
            enteredUsername: username || ''
        });
    }
});

app.get('/logout', (req, res) => {
    app.locals.user = null;
    res.redirect('/login?logged_out=1');
});

app.get('/books/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let book = null;
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
            book = await Book.findById(id).maxTimeMS(2000).lean().catch(() => null);
        }
        if (!book) {
            book = defaultBooks.find(b => String(b._id) === String(id));
        }
        if (!book) {
            return res.redirect('/books');
        }
        res.render('editbook', { book });
    } catch (err) {
        res.redirect('/books');
    }
});

app.post('/books/edit/:id', async (req, res) => {
    try {
        const { name, title, author, price, category, image } = req.body;

        const updatedData = {
            name: name || title,
            title: title || name,
            author,
            price: Number(price),
            category,
        };

        if (image && image.trim()) {
            updatedData.image = image.trim();
        }

        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
            await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true }).maxTimeMS(3000);
        }
        res.redirect('/books');
    } catch (err) {
        res.redirect('/books');
    }
});

app.get('/category', async (req, res) => {
    try {
        const books = await getBooksFast();
        const categoriesList = [...new Set(books.map(book => book.category))];
        res.render('categories', { books, category: 'All', categories: categoriesList });
    } catch (err) {
        const categoriesList = [...new Set(defaultBooks.map(book => book.category))];
        res.render('categories', { books: defaultBooks, category: 'All', categories: categoriesList });
    }
});

app.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const allBooks = await getBooksFast();
        const categoriesList = [...new Set(allBooks.map(book => book.category))];
        const filteredBooks = allBooks.filter(book => 
            (book.category || '').toLowerCase() === category.trim().toLowerCase()
        );
        res.render('categories', { books: filteredBooks, category, categories: categoriesList });
    } catch (err) {
        res.render('categories', { books: defaultBooks, category: req.params.category, categories: [] });
    }
});
app.get('/contact',(req,res)=>{
    const success = req.query.success === '1';
    const error = req.query.error === '1';
    res.render('contact', { success, error });
})
app.post('/contact', async (req, res) => {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim();
    const mobile = (req.body.mob || '').trim();
    const message = (req.body.message || '').trim();
    const cartItems = app.locals.cart || [];

    // Always save message to MongoDB so it is NEVER lost
    try {
        if (mongoose.connection.readyState === 1) {
            await ContactMessage.create({
                name,
                email,
                mobile,
                message
            });
            console.log(`[Contact] Saved new message from "${name}" (${email}) to MongoDB.`);
        }
    } catch (dbErr) {
        console.error('[Contact] Error saving message to DB:', dbErr.message);
    }

    // Recipient email: configured via ADMIN_EMAIL or EMAIL_USER
    const adminRecipient = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'sentejaswi66@gmail.com';

    const cartHtml = cartItems.length
        ? cartItems.map(item => {
            const imagePath = item.image ? path.join(__dirname, 'public', item.image) : null;
            const safeName = escapeHtml(item.name || item.title || 'Book');
            const safePrice = escapeHtml(item.price || 0);
            const safeCategory = escapeHtml(item.category || 'Uncategorized');

            return `
                <div style="display: flex; align-items: center; gap: 16px; border: 1px solid #e0e0e0; border-radius: 12px; padding: 14px; margin: 12px 0; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    ${imagePath ? `<img src="cid:book-${String(item._id)}" alt="${safeName}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px; background: #f7f7f7;" />` : ''}
                    <div>
                        <div style="font-size: 16px; font-weight: 700; color: #1f1f1f; margin-bottom: 4px;">${safeName}</div>
                        <div style="font-size: 13px; color: #555; margin-bottom: 4px;">Category: ${safeCategory}</div>
                        <div style="font-size: 14px; color: #4338ca; font-weight: 700;">Price: ₹${safePrice}</div>
                    </div>
                </div>
            `;
        }).join('')
        : '<p style="margin: 0; color: #888; font-style: italic;">No books currently in shopping cart.</p>';

    const attachments = cartItems
        .filter(item => item.image)
        .map(item => ({
            filename: path.basename(item.image),
            path: path.join(__dirname, 'public', item.image),
            cid: `book-${String(item._id)}`
        }));

    // If EMAIL_USER and EMAIL_PASS are not configured, fallback gracefully since message is saved in DB
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[Contact] EMAIL_USER or EMAIL_PASS not configured. Message preserved in MongoDB for ${adminRecipient}.`);
        app.locals.cart = [];
        return res.redirect('/contact?success=1');
    }

    transport.sendMail({
        from: `"BookStore Contact" <${process.env.EMAIL_USER}>`,
        to: adminRecipient,
        replyTo: email,
        subject: `New Customer Message from ${name || 'Customer'}`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; padding: 30px 15px; color: #1e293b;">
                <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #171936, #312e81); color: #ffffff; padding: 24px 28px;">
                        <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">📚 BookStore - New Customer Inquiry</h2>
                        <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">A new message was submitted via the contact form on your website.</p>
                    </div>

                    <div style="padding: 28px;">
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 130px;">Customer Name:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700;">${escapeHtml(name)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Customer Email:</td>
                                <td style="padding: 8px 0; color: #4338ca; font-size: 14px; font-weight: 700;"><a href="mailto:${escapeHtml(email)}" style="color: #4338ca; text-decoration: underline;">${escapeHtml(email)}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Mobile Number:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700;"><a href="tel:${escapeHtml(mobile)}" style="color: #0f172a; text-decoration: none;">${escapeHtml(mobile)}</a></td>
                            </tr>
                        </table>

                        <div style="background: #f1f5f9; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                            <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Customer Message:</div>
                            <div style="font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${escapeHtml(message)}</div>
                        </div>

                        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            <h4 style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #0f172a;">Customer's Cart Preview:</h4>
                            ${cartHtml}
                        </div>
                    </div>

                    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 28px; text-align: center; font-size: 12px; color: #64748b;">
                        💡 You can reply directly to this email to answer ${escapeHtml(name)} directly.
                    </div>
                </div>
            </div>
        `,
        attachments
    }, (error, info) => {
        if (error) {
            console.error('[Contact] Error sending email via Nodemailer:', error);
            // Since message was saved in DB, return success to customer
            app.locals.cart = [];
            return res.redirect('/contact?success=1');
        }

        console.log(`[Contact] Email sent successfully to ${adminRecipient}. MessageId:`, info ? info.messageId : 'OK');
        app.locals.cart = [];
        return res.redirect('/contact?success=1');
    });
});

// Admin Route to view all customer contact messages
app.get('/admin/messages', async (req, res) => {
    try {
        let messages = [];
        if (mongoose.connection.readyState === 1) {
            messages = await ContactMessage.find().sort({ createdAt: -1 }).lean().catch(() => []);
        }
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin - Contact Messages</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body class="bg-gray-50 text-gray-900 p-6 sm:p-10 font-sans">
                <div class="max-w-4xl mx-auto space-y-6">
                    <div class="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div>
                            <h1 class="text-2xl font-black text-gray-900">📬 Customer Contact Inquiries</h1>
                            <p class="text-xs text-gray-500 mt-1">All messages submitted via the website contact form</p>
                        </div>
                        <a href="/contact" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition">View Contact Page</a>
                    </div>
                    ${messages.length === 0 ? `
                        <div class="p-12 text-center bg-white rounded-2xl border border-gray-200">
                            <span class="text-3xl">📭</span>
                            <h3 class="text-base font-bold text-gray-800 mt-2">No messages received yet</h3>
                            <p class="text-xs text-gray-500 mt-1">When someone sends a message from /contact, it will appear here.</p>
                        </div>
                    ` : `
                        <div class="space-y-4">
                            ${messages.map(m => `
                                <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-gray-100">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-sm text-gray-900">${m.name || 'Anonymous'}</span>
                                            <span class="text-xs text-indigo-600 font-semibold">&lt;${m.email || 'No email'}&gt;</span>
                                        </div>
                                        <div class="flex items-center gap-3 text-xs text-gray-500">
                                            <span>📞 ${m.mobile || 'N/A'}</span>
                                            <span>🕒 ${new Date(m.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-700 whitespace-pre-wrap pt-1">${m.message || ''}</p>
                                    <div class="pt-2">
                                        <a href="mailto:${m.email}?subject=Regarding your message on BookStore" class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                                            <span>Reply via Email</span>
                                            <span>→</span>
                                        </a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Error loading messages: ' + err.message);
    }
});


app.post('/books/delete/:id', async (req, res) => {
    const bookId = req.params.id;
    await Book.findByIdAndDelete(bookId);
    res.redirect('/books');
});


app.listen(PORT,()=>{
    console.log("Listening on "+PORT)
})




// http://localhost:3000 --- run chrome
// E:\Node\Book Store> ---node index.js



