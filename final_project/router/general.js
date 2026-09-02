const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Origin of the Running Server, Consumed by the Axios Powered Routes
const BASE_URL = "http://localhost:5000";

// Promise Resolving to the Complete Book Catalogue
const fetchAllBooks = () =>
    new Promise((resolve) => resolve(books));

// Promise Resolving to the Single Book Registered Under a Given ISBN
const fetchBookByISBN = (isbn) =>
    new Promise((resolve, reject) => {
        const book = books[isbn];

        if (book) {
            resolve({ isbn, ...book });
        } else {
            reject(new Error(`No book was found for the ISBN ${isbn}.`));
        }
    });

// Promise Resolving to Every Book Attributed to a Given Author
const fetchBooksByAuthor = (author) =>
    new Promise((resolve, reject) => {
        const matches = Object.keys(books)
            .filter((isbn) => books[isbn].author.toLowerCase() === author.toLowerCase())
            .map((isbn) => ({ isbn, ...books[isbn] }));

        if (matches.length > 0) {
            resolve(matches);
        } else {
            reject(new Error(`No books were found for the author ${author}.`));
        }
    });

// Promise Resolving to Every Book Published Under a Given Title
const fetchBooksByTitle = (title) =>
    new Promise((resolve, reject) => {
        const matches = Object.keys(books)
            .filter((isbn) => books[isbn].title.toLowerCase() === title.toLowerCase())
            .map((isbn) => ({ isbn, ...books[isbn] }));

        if (matches.length > 0) {
            resolve(matches);
        } else {
            reject(new Error(`No books were found for the title ${title}.`));
        }
    });

// Promise Resolving to the Reviews Recorded Against a Given ISBN
const fetchReviewsByISBN = (isbn) =>
    new Promise((resolve, reject) => {
        const book = books[isbn];

        if (book) {
            resolve(book.reviews);
        } else {
            reject(new Error(`No book was found for the ISBN ${isbn}.`));
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

// Retrieve the List of Books Available in the Shop
public_users.get('/', function (req, res) {
    fetchAllBooks()
        .then((catalogue) => {
            res.set("Content-Type", "application/json");
            return res.status(200).send(JSON.stringify(catalogue, null, 4));
        })
        .catch((error) => res.status(500).json({ message: error.message }));
});

// Retrieve the Book Details Belonging to a Specified ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    fetchBookByISBN(req.params.isbn)
        .then((book) => {
            res.set("Content-Type", "application/json");
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => res.status(404).json({ message: error.message }));
});

// Retrieve Every Book Written by a Specified Author
public_users.get('/author/:author', function (req, res) {
    fetchBooksByAuthor(req.params.author)
        .then((matches) => {
            res.set("Content-Type", "application/json");
            return res.status(200).send(JSON.stringify({ booksbyauthor: matches }, null, 4));
        })
        .catch((error) => res.status(404).json({ message: error.message }));
});

// Retrieve Every Book Carrying a Specified Title
public_users.get('/title/:title', function (req, res) {
    fetchBooksByTitle(req.params.title)
        .then((matches) => {
            res.set("Content-Type", "application/json");
            return res.status(200).send(JSON.stringify({ booksbytitle: matches }, null, 4));
        })
        .catch((error) => res.status(404).json({ message: error.message }));
});

// Retrieve the Reviews Recorded Against a Specified ISBN
public_users.get('/review/:isbn', function (req, res) {
    fetchReviewsByISBN(req.params.isbn)
        .then((reviews) => {
            if (Object.keys(reviews).length === 0) {
                return res.status(200).json({ message: "No reviews found for this book." });
            }

            res.set("Content-Type", "application/json");
            return res.status(200).send(JSON.stringify(reviews, null, 4));
        })
        .catch((error) => res.status(404).json({ message: error.message }));
});

// Task 10: Retrieve the Full Catalogue Through Axios and Async/Await
public_users.get('/async/books', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/`);

        res.set("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "The book catalogue could not be retrieved." });
    }
});

// Task 11: Retrieve a Book by ISBN Through Axios and Async/Await
public_users.get('/async/isbn/:isbn', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(req.params.isbn)}`);

        res.set("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({ message: `No book was found for the ISBN ${req.params.isbn}.` });
    }
});

// Task 12: Retrieve Books by Author Through Axios and Async/Await
public_users.get('/async/author/:author', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);

        res.set("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({ message: `No books were found for the author ${req.params.author}.` });
    }
});

// Task 13: Retrieve Books by Title Through Axios and Async/Await
public_users.get('/async/title/:title', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`);

        res.set("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({ message: `No books were found for the title ${req.params.title}.` });
    }
});

module.exports.general = public_users;
