import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureAuth } from './auth.js';
import mongoose from 'mongoose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 1967;

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, '../src')));

// Middleware to parse JSON data
app.use(express.json());

// Enable CORS
app.use(cors());

// Configure authentication
configureAuth(app);


// JOBS
// Route to get all jobs with optional limit
app.get('/jobs', (req, res) => {
    const limit = parseInt(req.query._limit, 10); // Get the _limit query parameter and convert to integer

    fs.readFile(path.join(__dirname, '../data/jobs.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ error: 'Unable to read data' });
        }

        try {
            const parsedData = JSON.parse(data);
            const jobs = parsedData.jobs;  // Access the jobs array inside the parsed JSON object

            if (Array.isArray(jobs)) {
                const limitedJobs = limit ? jobs.slice(0, limit) : jobs; // Apply the limit if it exists
                res.json(limitedJobs);  // Send the limited jobs array as a JSON response
            } else {
                console.error('Data is not in expected array format:', jobs);
                res.status(500).json({ error: 'Data is not in expected array format' });
            }
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
            res.status(500).json({ error: 'Error parsing JSON data' });
        }
    });
});

// Route to get a job by ID
app.get('/jobs/:id', (req, res) => {
    const jobId = req.params.id;

    fs.readFile(path.join(__dirname, '../data/jobs.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ error: 'Unable to read data' });
        }

        try {
            const parsedData = JSON.parse(data);
            const jobs = parsedData.jobs;

            if (Array.isArray(jobs)) {
                const job = jobs.find(job => job.id === jobId);

                if (job) {
                    res.json(job);
                } else {
                    res.status(404).json({ error: `Job with id ${jobId} not found` });
                }
            } else {
                console.error('Data is not in expected array format:', jobs);
                res.status(500).json({ error: 'Data is not in expected array format' });
            }
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
            res.status(500).json({ error: 'Error parsing JSON data' });
        }
    });
});

app.post('/jobs', (req, res) => {
    const newJob = req.body;
  
    // Read the existing jobs from the file
    fs.readFile(path.join(__dirname, '../data/jobs.json'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return res.status(500).json({ error: 'Unable to read data' });
      }
  
      try {
        const parsedData = JSON.parse(data);
        const jobs = parsedData.jobs;
  
        // Generate a new ID (assuming jobs have a numeric ID)
        newJob.id = (jobs.length + 1).toString();
        
        // Add the new job to the jobs array
        jobs.push(newJob);
  
        // Save the updated jobs back to the file
        fs.writeFile(path.join(__dirname, '../data/jobs.json'), JSON.stringify({ jobs }), 'utf8', (err) => {
          if (err) {
            console.error('Error writing to the file:', err);
            return res.status(500).json({ error: 'Unable to save job' });
          }
  
          res.status(201).json(newJob); // Respond with the new job
        });
        
      } catch (parseError) {
        console.error('Error parsing JSON data:', parseError);
        res.status(500).json({ error: 'Error parsing JSON data' });
      }
    });
  });

// Route to delete a job by ID
app.delete('/jobs/:id', (req, res) => {
    const jobId = req.params.id;

    fs.readFile(path.join(__dirname, '../data/jobs.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ error: 'Unable to read data' });
        }

        try {
            const parsedData = JSON.parse(data);
            let jobs = parsedData.jobs;

            if (Array.isArray(jobs)) {
                jobs = jobs.filter(job => job.id !== jobId);

                fs.writeFile(path.join(__dirname, '../data/jobs.json'), JSON.stringify({ jobs }), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing to the file:', err);
                        return res.status(500).json({ error: 'Unable to delete job' });
                    }

                    res.status(204).send(); // No content
                });
            } else {
                console.error('Data is not in expected array format:', jobs);
                res.status(500).json({ error: 'Data is not in expected array format' });
            }
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
            res.status(500).json({ error: 'Error parsing JSON data' });
        }
    });
});

// Route to update a job by ID
app.put('/jobs/:id', (req, res) => {
    const jobId = req.params.id;
    const updatedJob = req.body;

    fs.readFile(path.join(__dirname, '../data/jobs.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ error: 'Unable to read data' });
        }

        try {
            const parsedData = JSON.parse(data);
            let jobs = parsedData.jobs;

            if (Array.isArray(jobs)) {
                const jobIndex = jobs.findIndex(job => job.id === jobId);

                if (jobIndex !== -1) {
                    jobs[jobIndex] = { ...jobs[jobIndex], ...updatedJob };

                    fs.writeFile(path.join(__dirname, '../data/jobs.json'), JSON.stringify({ jobs }), 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing to the file:', err);
                            return res.status(500).json({ error: 'Unable to update job' });
                        }

                        res.json(jobs[jobIndex]);
                    });
                } else {
                    res.status(404).json({ error: `Job with id ${jobId} not found` });
                }
            } else {
                console.error('Data is not in expected array format:', jobs);
                res.status(500).json({ error: 'Data is not in expected array format' });
            }
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
            res.status(500).json({ error: 'Error parsing JSON data' });
        }
    });
});

// Catch-all handler to serve React's index.html for all unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});