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
    await mongoose.connect(mongoUri, {
        dbName: 'bookstore'
    });
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

const defaultBooks = [
    {
        name: "Atomic Habits",
        title: "Atomic Habits",
        author: "James Clear",
        price: 499,
        category: "Self learning",
        image: "img1.png"
    },
    {
        name: "Rich Dad Poor Dad",
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        price: 399,
        category: "Self learning",
        image: "img2.jpg"
    },
    {
        name: "The Hobbit",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        price: 599,
        category: "Fantasy",
        image: "img3.png"
    },
    {
        name: "The Psychology of Money",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        price: 450,
        category: "Self learning",
        image: "img4.png"
    },
    {
        name: "Think and Grow Rich",
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        price: 350,
        category: "Self learning",
        image: "img5.png"
    },
    {
        name: "The Alchemist",
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 299,
        category: "Fiction",
        image: "img6.png"
    },
    {
        name: "Harry Potter & Sorcerer's Stone",
        title: "Harry Potter & Sorcerer's Stone",
        author: "J.K. Rowling",
        price: 699,
        category: "Fantasy",
        image: "img7.png"
    },
    {
        name: "To Kill a Mockingbird",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        price: 399,
        category: "Classic",
        image: "img8.png"
    },
    {
        name: "Sapiens: A Brief History",
        title: "Sapiens: A Brief History",
        author: "Yuval Noah Harari",
        price: 599,
        category: "History",
        image: "img9.png"
    },
    {
        name: "Clean Code",
        title: "Clean Code",
        author: "Robert C. Martin",
        price: 899,
        category: "Technology",
        image: "img10.png"
    },
    {
        name: "Ikigai: Japanese Secret",
        title: "Ikigai: Japanese Secret",
        author: "Héctor García",
        price: 420,
        category: "Self learning",
        image: "img11.png"
    },
    {
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
        const count = await Book.countDocuments();
        if (count === 0) {
            await Book.insertMany(defaultBooks);
            console.log(`Auto-seeded ${defaultBooks.length} books into MongoDB bookstore database.`);
        }
    } catch (err) {
        console.error('Error during auto-seeding:', err);
    }
}

main()
.then(async () => {
    console.log('DB Connected');
    await seedDefaultBooks();
})
.catch((err) => {console.log(err)});
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
        let books = await Book.find();
        if (!books || books.length === 0) {
            await seedDefaultBooks();
            books = await Book.find();
        }
        res.render('home', { books: (books && books.length > 0) ? books : defaultBooks });
    } catch (err) {
        console.error('Error fetching books for home:', err);
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
        let books = await Book.find();
        if (!books || books.length === 0) {
            await seedDefaultBooks();
            books = await Book.find();
        }
        res.render('books', { books, added: req.query.added || null });
    } catch (err) {
        console.error('Error fetching books for /books:', err);
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
app.get(['/books/buy/:id', '/books/buy-now/:id'], async (req, res) => {
    try {
        let book = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            book = await Book.findById(req.params.id);
        }
        if (!book) {
            book = defaultBooks.find(b => b.name === req.params.id || b.image === req.params.id) || defaultBooks[0];
        }

        if (book) {
            addCartItem(book);
        }
        res.redirect('/cart');
    } catch (err) {
        console.error('Error in buy now:', err);
        res.redirect('/cart');
    }
});

// Add to Cart Route: Adds book to cart and keeps user on page or redirects
app.get('/books/add-to-cart/:id', async (req, res) => {
    try {
        let book = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            book = await Book.findById(req.params.id);
        }
        if (!book) {
            book = defaultBooks.find(b => b.name === req.params.id || b.image === req.params.id) || defaultBooks[0];
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
    const book = await Book.findById(req.params.id);
    if (!book) {
        return res.redirect('/books');
    }

    res.render('editbook', { book });
});

app.post('/books/edit/:id', async (req, res) => {
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

    await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.redirect('/books');
});

app.get('/category', async (req, res) => {
    const books = await Book.find();
    const allBooks = await Book.find();
    const categoriesList = [...new Set(allBooks.map(book => book.category))];
    res.render('categories', { books, category: 'All', categories: categoriesList });
});

app.get('/category/:category', async (req, res) => {
    const category = req.params.category;
    const escapedCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const books = await Book.find({
        category: { $regex: `^${escapedCategory}$`, $options: 'i' }
    });
    const allBooks = await Book.find();
    const categoriesList = [...new Set(allBooks.map(book => book.category))];
    res.render('categories', { books, category, categories: categoriesList });
});
app.get('/contact',(req,res)=>{
    const success = req.query.success === '1';
    const error = req.query.error === '1';
    res.render('contact', { success, error });
})
app.post('/contact', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mob;
    const message = req.body.message;
    const cartItems = app.locals.cart || [];

    const cartHtml = cartItems.length
        ? cartItems.map(item => {
            const imagePath = item.image ? path.join(__dirname, 'public', item.image) : null;
            const safeName = escapeHtml(item.name || item.title || 'Book');
            const safePrice = escapeHtml(item.price || 0);
            const safeCategory = escapeHtml(item.category || 'Uncategorized');

            return `
                <div style="display: flex; align-items: center; gap: 16px; border: 1px solid #e0e0e0; border-radius: 12px; padding: 14px; margin: 12px 0; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    ${imagePath ? `<img src="cid:book-${String(item._id)}" alt="${safeName}" style="width: 90px; height: 90px; object-fit: contain; border-radius: 8px; background: #f7f7f7;" />` : ''}
                    <div>
                        <div style="font-size: 18px; font-weight: 700; color: #1f1f1f; margin-bottom: 4px;">${safeName}</div>
                        <div style="font-size: 14px; color: #555; margin-bottom: 4px;">Category: ${safeCategory}</div>
                        <div style="font-size: 15px; color: #1f1f1f; font-weight: 600;">Price: ₹${safePrice}</div>
                    </div>
                </div>
            `;
        }).join('')
        : '<p style="margin: 0; color: #666;">No books selected.</p>';

    const attachments = cartItems
        .filter(item => item.image)
        .map(item => ({
            filename: path.basename(item.image),
            path: path.join(__dirname, 'public', item.image),
            cid: `book-${String(item._id)}`
        }));

    transport.sendMail({
        to: 'adarshgiriag2006@gmail.com',
        subject: 'New Customer Message',
        html: `
            <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 24px; color: #111;">
                <div style="max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7e7e7;">
                    <div style="background: linear-gradient(135deg, #202124, #3c4043); color: #fff; padding: 20px 24px; font-size: 24px; font-weight: 700;">
                        New Customer Message
                    </div>

                    <div style="padding: 22px 24px 8px;">
                        <div style="margin-bottom: 14px;"><strong>Name:</strong> ${escapeHtml(name)}</div>
                        <div style="margin-bottom: 14px;"><strong>Email:</strong> ${escapeHtml(email)}</div>
                        <div style="margin-bottom: 14px;"><strong>Mobile:</strong> ${escapeHtml(mobile)}</div>
                        <div style="margin-bottom: 18px;"><strong>Message:</strong> ${escapeHtml(message)}</div>
                    </div>

                    <div style="padding: 0 24px 24px;">
                        <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px; color: #1f1f1f;">Books in Cart</div>
                        ${cartHtml}
                    </div>
                </div>
            </div>
        `,
        attachments
    }, (error, info) => {
        if (error) {
            console.log(error);
            return res.redirect('/contact?error=1');
        }

        app.locals.cart = [];
        return res.redirect('/contact?success=1');
    });
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



