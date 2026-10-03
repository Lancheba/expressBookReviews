const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists or username is invalid" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const result = {};
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author) result[isbn] = books[isbn];
  });
  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }
  return res.status(200).json(result);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const result = {};
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title) result[isbn] = books[isbn];
  });
  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }
  return res.status(200).json(result);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book.reviews);
});

/* ---------- Axios versions (promise callbacks / async-await) ---------- */

// All books (async/await)
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

// By ISBN (promise callbacks)
public_users.get('/async/isbn/:isbn', (req, res) => {
  axios.get(`${BASE_URL}/isbn/${req.params.isbn}`)
    .then((response) => res.status(200).json(response.data))
    .catch((err) => res.status(500).json({ message: "Error fetching book", error: err.message }));
});

// By author (async/await)
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

// By title (async/await)
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

module.exports.general = public_users;