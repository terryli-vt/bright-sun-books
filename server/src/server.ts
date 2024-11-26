import app from "./app";

const PORT = process.env.PORT || 8000;

// Starts the server and listens for incoming requests.
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
