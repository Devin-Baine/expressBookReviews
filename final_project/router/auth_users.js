const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Determine Whether a Username Already Exists Within the Registry
const isValid = (username) => {
    return users.some((user) => user.username === username);
};

// Determine Whether the Supplied Credentials Match a Registered User
const authenticatedUser = (username, password) => {
    return users.some((user) => user.username === username && user.password === password);
};

// Log In as a Registered User and Open an Authenticated Session
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Demand a Complete Set of Credentials
    if (!username || !password) {
        return res.status(400).json({ message: "Logging in requires both a username and a password." });
    }

    // Validate the Credentials Against the Registry
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Login failed. The username or password is incorrect." });
    }

    // Sign the Access Token and Store It Within the Session
    const accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });

    req.session.authorization = { accessToken, username };

    return res.status(200).json({
        message: `User ${username} has logged in successfully.`,
        accessToken
    });
});

// Add a Book Review, or Modify the Review the User Previously Left
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const { username } = req.session.authorization;
    const book = books[isbn];

    // Confirm the Book Exists Before Recording Any Opinion of It
    if (!book) {
        return res.status(404).json({ message: `No book was found for the ISBN ${isbn}.` });
    }

    // Demand Review Text Supplied Through the Request Query
    if (!review) {
        return res.status(400).json({ message: "A review must be supplied through the review query parameter." });
    }

    const alreadyReviewed = Object.prototype.hasOwnProperty.call(book.reviews, username);

    book.reviews[username] = review;

    return res.status(200).json({
        message: alreadyReviewed
            ? `The review of ISBN ${isbn} posted by ${username} has been modified successfully.`
            : `A review of ISBN ${isbn} has been added successfully for ${username}.`,
        reviews: book.reviews
    });
});

// Delete Only the Review That the Logged In User Owns
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { username } = req.session.authorization;
    const book = books[isbn];

    // Confirm the Book Exists Before Attempting Any Removal
    if (!book) {
        return res.status(404).json({ message: `No book was found for the ISBN ${isbn}.` });
    }

    // Restrict the Deletion to Reviews Owned by the Requesting User
    if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
        return res.status(404).json({ message: `No review of ISBN ${isbn} was posted by ${username}.` });
    }

    delete book.reviews[username];

    return res.status(200).json({
        message: `The review of ISBN ${isbn} posted by ${username} has been deleted successfully.`,
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
