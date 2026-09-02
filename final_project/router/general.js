const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Resolve the Origin of the Incoming Request So Axios Targets This Same Server
const originOf = (req) => `${req.protocol}://${req.get("host")}`;

// Catalogue Data Source Backing Every Axios Request Issued Below
public_users.get('/catalogue', function (req, res) {
    return res.status(200).json(books);
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

// Task 10: Retrieve Every Book Available in the Shop Using Async/Await With Axios
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get(`${originOf(req)}/catalogue`);

        res.set("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(response.data));
    } catch (error) {
        return res.status(500).json({ message: "The book catalogue could not be retrieved." });
    }
});

// Task 11: Retrieve the Book Details Belonging to a Specified ISBN Using Async/Await With Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    const { isbn } = req.params;

    try {
        const response = await axios.get(`${originOf(req)}/catalogue`);
        const book = response.data[isbn];

        if (!book) {
            return res.status(404).json({ message: `No book was found for the ISBN ${isbn}.` });
        }

        res.set("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify({ isbn, ...book }));
    } catch (error) {
        return res.status(500).json({ message: "The book catalogue could not be retrieved." });
    }
});

// Task 12: Retrieve Every Book Written by a Specified Author Using Async/Await With Axios
public_users.get('/author/:author', async function (req, res) {
    const { author } = req.params;

    try {
        const response = await axios.get(`${originOf(req)}/catalogue`);
        const catalogue = response.data;

        const matches = Object.keys(catalogue)
            .filter((isbn) => catalogue[isbn].author.toLowerCase() === author.toLowerCase())
            .map((isbn) => ({ isbn, ...catalogue[isbn] }));

        if (matches.length === 0) {
            return res.status(404).json({ message: `No books were found for the author ${author}.` });
        }

        res.set("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(matches));
    } catch (error) {
        return res.status(500).json({ message: "The book catalogue could not be retrieved." });
    }
});

// Task 13: Retrieve Every Book Carrying a Specified Title Using Async/Await With Axios
public_users.get('/title/:title', async function (req, res) {
    const { title } = req.params;

    try {
        const response = await axios.get(`${originOf(req)}/catalogue`);
        const catalogue = response.data;

        const matches = Object.keys(catalogue)
            .filter((isbn) => catalogue[isbn].title.toLowerCase() === title.toLowerCase())
            .map((isbn) => ({ isbn, ...catalogue[isbn] }));

        if (matches.length === 0) {
            return res.status(404).json({ message: `No books were found for the title ${title}.` });
        }

        res.set("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(matches));
    } catch (error) {
        return res.status(500).json({ message: "The book catalogue could not be retrieved." });
    }
});

// Retrieve the Reviews Recorded Against a Specified ISBN
public_users.get('/review/:isbn', async function (req, res) {
    const { isbn } = req.params;

    try {
        const response = await axios.get(`${originOf(req)}/catalogue`);
        const book = response.data[isbn];

        if (!book) {
            return res.status(404).json({ message: `No book was found for the ISBN ${isbn}.` });
        }

        if (Object.keys(book.reviews).length === 0) {
            return res.status(200).json({ message: "No reviews found for this book." });
        }

        res.set("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(book.reviews));
    } catch (error) {
        return res.status(500).json({ message: "The book reviews could not be retrieved." });
    }
});

module.exports.general = public_users;
