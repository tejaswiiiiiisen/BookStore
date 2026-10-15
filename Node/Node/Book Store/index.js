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

main()
.then(() => {console.log('DB Connected')})
.catch((err) => {console.log(err)});

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    price: Number,
    category: String,
    image: String
});

const Book = mongoose.model('Book', bookSchema);
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.set(express.static(path.join(__dirname,'public')));

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'adarshgiriag2006@gmail.com',
        pass: process.env.EMAIL_PASS || 'xucx bqyn nelk qvha'
    }
});

app.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.render('home', { books });
    } catch (err) {
        res.render('home', { books: [] });
    }
});
app.get('/about',(req,res)=>{
    res.render('about')
})
app.get('/books', async (req, res) => {
    const books = await Book.find();
    res.render('books', { books });
});

app.get('/category',(req,res)=>{
    res.render('categories')
})
app.get('/contact',(req,res)=>{
    res.render('contact')
})
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
})
app.post('/contact', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mob;
    const message = req.body.message;

    transport.sendMail({
        to: 'adarshgiriag2006@gmail.com',
        subject: 'New Customer Message',
        text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\nMessage: ${message}`
    }, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error not sent');
        }

        return res.redirect('/contact');
    });
});


app.listen(PORT,()=>{
    console.log("Listening on "+PORT)
})




// http://localhost:3000 --- run chrome
// E:\Node\Book Store> ---node index.js




