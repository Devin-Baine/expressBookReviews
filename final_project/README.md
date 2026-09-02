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
| `GET` | `/catalogue` | Serve the raw catalogue that the asynchronous routes request through Axios. |
| `POST` | `/register` | Register a new user from a JSON body of `username` and `password`. |

## Registered User Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/customer/login` | Authenticate a registered user and open a session carrying a signed JWT. |
| `PUT` | `/customer/auth/review/:isbn?review=` | Add a review, or modify the review the requesting user previously left. |
| `DELETE` | `/customer/auth/review/:isbn` | Delete only the review owned by the requesting user. |

## Concurrency Model

Four named asynchronous functions within `router/general.js` carry the retrieval work, each awaiting an Axios
request against the `/catalogue` endpoint so that no client ever blocks another while the shop is queried.

| Function | Retrieves |
| --- | --- |
| `getAllBooks` | Every book available in the shop. |
| `getBookByISBN` | Book details matching a supplied ISBN. |
| `getBooksByAuthor` | Book details matching a supplied author. |
| `getBooksByTitle` | Book details matching a supplied title. |

Request origins resolve from the incoming request itself rather than a hardcoded address, allowing the server to
relocate to any host or port without alteration.

## Submission Artifacts

The `submission` directory at the repository root holds each cURL command paired with its terminal output, saved
under the file names the project brief specifies.
