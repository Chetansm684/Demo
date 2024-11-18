const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();

// Directory where the files will be created
const FILES_DIRECTORY = path.join(__dirname, "cp");

// Ensure the directory exists
if (!fs.existsSync(FILES_DIRECTORY)) {
  fs.mkdirSync(FILES_DIRECTORY);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Render the form at /route
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Create C++ File</title>
    </head>
    <body>
        <h1>Create a C++ File</h1>
        <form method="POST" action="/">
            <label for="filename">Filename:</label>
            <input type="text" id="filename" name="filename" required>
            <br><br>
            <label for="file_content">File Content:</label>
            <textarea id="file_content" name="file_content" rows="10" cols="50" required></textarea>
            <br><br>
            <button type="submit">Create File</button>
        </form>
    </body>
    </html>
  `);
});

// Handle form submission
app.post("/", (req, res) => {
  const { filename, file_content } = req.body;

  if (!filename || !file_content) {
    return res.status(400).send("Filename and file content are required.");
  }

  // Sanitize the filename to avoid path traversal
  let safeFilename = path.basename(filename);

  // Ensure the filename ends with .cpp
  if (!safeFilename.endsWith(".cpp")) {
    safeFilename += ".cpp";
  }

  const filePath = path.join(FILES_DIRECTORY, safeFilename);

  // Write the content to the file
  fs.writeFile(filePath, file_content, (err) => {
    if (err) {
      console.error("Error creating file:", err);
      return res.status(500).send("Failed to create file.");
    }
    console.log(`File created: ${filePath}`);
    res.send(`
      <h1>File Created Successfully</h1>
      <p>Filename: ${safeFilename}</p>
      <p><a href="/">Go Back</a></p>
    `);
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});