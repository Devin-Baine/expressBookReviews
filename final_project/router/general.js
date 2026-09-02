// Book Catalogue Routes Retrieving All Books, and Book Details by ISBN, Author, and Title
const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Origin of the Catalogue Service That Every Axios Request Below Targets
const originOf = (req) => `${req.protocol}://${req.get("host")}`;

// Task 10: Retrieve All Books Available in the Shop Using Async/Await With Axios
const getAllBooks = async (req) => {
    const response = await axios.get(`${originOf(req)}/catalogue`);

    return response.data;
};

// Task 11: Retrieve Book Details Based on ISBN Using Async/Await With Axios
const getBookByISBN = async (req, isbn) => {
    const response = await axios.get(`${originOf(req)}/catalogue`);
    const book = response.data[isbn];

    return book ? { isbn, ...book } : null;
};

// Task 12: Retrieve Book Details Based on Author Using Async/Await With Axios
const getBooksByAuthor = async (req, author) => {
    const response = await axios.get(`${originOf(req)}/catalogue`);
    const catalogue = response.data;

    return Object.keys(catalogue)
        .filter((isbn) => catalogue[isbn].author.toLowerCase() === author.toLowerCase())
        .map((isbn) => ({ isbn, ...catalogue[isbn] }));
};

// Task 13: Retrieve Book Details Based on Title Using Async/Await With Axios
const getBooksByTitle = async (req, title) => {
    const response = await axios.get(`${originOf(req)}/catalogue`);
    const catalogue = response.data;

    return Object.keys(catalogue)
        .filter((isbn) => catalogue[isbn].title.toLowerCase() === title.toLowerCase())
        .map((isbn) => ({ isbn, ...catalogue[isbn] }));
};

// Serve Every Book Held in the Shop
public_users.get('/', async function (req, res) {
    try {
        return res.status(200).json(await getAllBooks(req));
    } catch (error) {
        return res.status(500).json({ message: "The book catalogue could not be retrieved." });
    }
});

// Serve the Single Book Matching the Requested ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const { isbn } = req.params;

    try {
        const book = await getBookByISBN(req, isbn);

        if (!book) {
            return res.status(404).json({ message: `No book was found for the ISBN ${isbn}.` });
        }

        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({ message: "The book catalogue could not be retrieved." });
    }
});

// Serve Every Book Written by the Requested Author
public_users.get('/author/:author', async function (req, res) {
    const { author } = req.params;

    try {
        const matches = await getBooksByAuthor(req, author);

        if (matches.length === 0) {
            return res.status(404).json({ message: `No books were found for the author ${author}.` });
        }

        return res.status(200).json(matches);
    } catch (error) {
        return res.status(500).json({ message: "The book catalogue could not be retrieved." });
    }
});

// Serve Every Book Carrying the Requested Title
public_users.get('/title/:title', async function (req, res) {
    const { title } = req.params;

    try {
        const matches = await getBooksByTitle(req, title);

        if (matches.length === 0) {
            return res.status(404).json({ message: `No books were found for the title ${title}.` });
        }

        return res.status(200).json(matches);
    } catch (error) {
        return res.status(500).json({ message: "The book catalogue could not be retrieved." });
    }
});

// Serve the Reviews Recorded Against the Requested ISBN
public_users.get('/review/:isbn', async function (req, res) {
    const { isbn } = req.params;

    try {
        const book = await getBookByISBN(req, isbn);

        if (!book) {
            return res.status(404).json({ message: `No book was found for the ISBN ${isbn}.` });
        }

        if (Object.keys(book.reviews).length === 0) {
            return res.status(200).json({ message: "No reviews found for this book." });
        }

        return res.status(200).json(book.reviews);
    } catch (error) {
        return res.status(500).json({ message: "The book reviews could not be retrieved." });
    }
});

// Register a Brand New User of the Application
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Demand a Complete Set of Credentials
    if (!username || !password) {
        return res.status(400).json({ message: "Registration requires both a username and a password." });
    }

    // Preserve the Uniqueness of Every Username
    if (isValid(username)) {
        return res.status(409).json({ message: `The username ${username} is already registered.` });
    }

    users.push({ username, password });

    return res.status(201).json({ message: `User ${username} has been registered successfully and may now log in.` });
});

// Catalogue Data Source Backing Every Axios Request Issued Above
public_users.get('/catalogue', function (req, res) {
    return res.status(200).json(books);
});

module.exports.general = public_users;
