const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Session Level Authentication Guarding the Protected Customer Routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Reject Any Request That Carries No Authenticated Session
    if (!req.session.authorization) {
        return res.status(403).json({ message: "Access denied. Please log in to continue." });
    }

    const { accessToken } = req.session.authorization;

    // Verify the JSON Web Token Issued at Login
    jwt.verify(accessToken, "access", (error, decoded) => {
        if (error) {
            return res.status(403).json({ message: "Access denied. The session token is invalid or expired." });
        }

        req.user = decoded;
        next();
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
