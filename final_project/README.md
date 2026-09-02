# Online Book Review Application

Server-side REST API for an online bookshop, built with Node.js and Express.js. General users may browse the
catalogue and read reviews, while registered users authenticate through a JWT-backed session before adding,
modifying, or deleting the reviews they own.

## Getting Started

```bash
cd final_project
npm install
npm start
```

The server listens on port `5000`.

## General User Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Retrieve every book available in the shop. |
| `GET` | `/isbn/:isbn` | Retrieve the book registered under the supplied ISBN. |
| `GET` | `/author/:author` | Retrieve every book attributed to the supplied author. |
| `GET` | `/title/:title` | Retrieve every book carrying the supplied title. |
| `GET` | `/review/:isbn` | Retrieve the reviews recorded against the supplied ISBN. |
| `POST` | `/register` | Register a new user from a JSON body of `username` and `password`. |

## Registered User Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/customer/login` | Authenticate a registered user and open a session carrying a signed JWT. |
| `PUT` | `/customer/auth/review/:isbn?review=` | Add a review, or modify the review the requesting user previously left. |
| `DELETE` | `/customer/auth/review/:isbn` | Delete only the review owned by the requesting user. |

## Asynchronous Endpoints

Mirrors of the four retrieval routes, implemented with Axios and async/await so that concurrent clients never
block one another.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/async/books` | Retrieve the full catalogue through Axios. |
| `GET` | `/async/isbn/:isbn` | Retrieve a single book by ISBN through Axios. |
| `GET` | `/async/author/:author` | Retrieve books by author through Axios. |
| `GET` | `/async/title/:title` | Retrieve books by title through Axios. |

## Concurrency Model

Every retrieval helper within `router/general.js` returns a Promise, and each public route consumes that Promise
through `.then()` and `.catch()` callbacks. The `/async` routes layer Axios and async/await over the same API,
demonstrating both asynchronous techniques required by the project.

## Submission Artifacts

The `submission` directory at the repository root holds each cURL command paired with its terminal output, saved
under the file names the project brief specifies.
