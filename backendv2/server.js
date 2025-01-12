const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/load", (req, res) => {
  // load problem
  let problem, result;
  const filePathProblem = path.join(__dirname, "problem.json");
  fs.readFile(filePathProblem, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading problem file: ${err.message}`);
      return res.status(500).json({ success: false, error: err.message });
    }

    try {
      problem = JSON.parse(data);
    } catch (parseError) {
      console.error(`Error parsing result file: ${parseError.message}`);
      res.status(500).json({ success: false, error: parseError.message });
    }
  });

  // load result
  const filePath = path.join(__dirname, "result.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading problem file: ${err.message}`);
      return res.status(500).json({ success: false, error: err.message });
    }
    try {
      result = JSON.parse(data);

      res.json({ success: true, problem, result });
    } catch (parseError) {
      console.error(`Error parsing result file: ${parseError.message}`);
      res.status(500).json({ success: false, error: parseError.message });
    }
  });
});

// Endpoint to run the Python script
app.post("/generate-problem", (req, res) => {
  const scriptPath = "./generate_problem.py";
  const args = "%userprofile%/downloads/problem.json";
  const resultFilePath = path.join(
    __dirname,
    "MedRoPax-Solver",
    "problem.json"
  );
  exec(
    `.\\vrp-venv\\Scripts\\python.exe ${scriptPath} ${args}`,
    { cwd: "./MedRoPax-Solver" },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return res.status(500).json({ success: false, error: error.message });
      }
      if (stderr) {
        console.warn(`Python stderr: ${stderr}`);
      }

      fs.readFile(resultFilePath, "utf8", (err, data) => {
        if (err) {
          console.error(`Error reading problem file: ${err.message}`);
          return res.status(500).json({ success: false, error: err.message });
        }

        try {
          const result = JSON.parse(data);
          res.json({ success: true, problem: result });
        } catch (parseError) {
          console.error(`Error parsing result file: ${parseError.message}`);
          res.status(500).json({ success: false, error: parseError.message });
        }
      });
    }
  );
});

app.post("/solve-generated-problem", (req, res) => {
  const scriptPath = "./solver.py";
  const args =
    "%userprofile%/Downloads/problem.json %userprofile%/Downloads/result.json";
  const resultFilePath = path.join(__dirname, "MedRoPax-Solver", "result.json");

  exec(
    `python ${scriptPath} ${args}`,
    { cwd: "./MedRoPax-Solver" },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return res.status(500).json({ success: false, error: error.message });
      }

      // Log warnings, but do not treat them as errors
      if (stderr) {
        console.warn(`Python stderr: ${stderr}`);
      }

      fs.readFile(resultFilePath, "utf8", (err, data) => {
        if (err) {
          console.error(`Error reading result file: ${err.message}`);
          return res.status(500).json({ success: false, error: err.message });
        }

        try {
          const result = JSON.parse(data);
          res.json({ success: true, result });
        } catch (parseError) {
          console.error(`Error parsing result file: ${parseError.message}`);
          res.status(500).json({ success: false, error: parseError.message });
        }
      });
    }
  );
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
