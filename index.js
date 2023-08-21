const express = require('express');
const fs = require('fs').promises; // Use the fs.promises API for asynchronous operations
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes

app.get('/directory-listing', async (req, res) => {
    const directoryPath = req.query.path || __dirname; // Default to current directory

    try {
        const files = await fs.readdir(directoryPath, { withFileTypes: true });

        const result = await Promise.all(files.map(async (file) => {
            const filePath = path.join(directoryPath, file.name);
            const stats = await fs.stat(filePath);
            const fileInfo = {
                name: file.name,
                fullPath: filePath,
                size: stats.size,
                extension: path.extname(file.name),
                createdDate: stats.birthtime,
                isDirectory: file.isDirectory(),
                permissions: file.isDirectory() ? 'S_IRWXU' : 'S_IRUSR',
            };
            return fileInfo;
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while reading the directory.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
