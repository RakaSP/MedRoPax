const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "MedRoPax-Solver/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const pdfParse = require("pdf-parse");

// Endpoint to read a PDF file and extract text

app.post("/read-pdf", (req, res) => {
  const { indexOfVehicle } = req.body;
  const pdfPath = path.join(
    __dirname,
    "MedRoPax-Solver/problem_result",
    `Loading-Plan-${indexOfVehicle}.pdf`
  ); // Path to the PDF file

  console.log(pdfPath);
  // Check if the PDF file exists
  fs.exists(pdfPath, (exists) => {
    if (!exists) {
      return res
        .status(404)
        .json({ success: false, error: "PDF file not found" });
    }

    // Send the PDF file as a response
    res.sendFile(pdfPath, (err) => {
      if (err) {
        console.error(`Error sending PDF file: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
      }
    });
  });
});

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

      res.json({
        success: true,
        problem,
        result,
        dirPath,
      });
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

app.post("/solve", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const uploadedFilePath = req.file.path;
    const originalFilename = req.file.originalname;
    const originalFileNameWithoutExt = req.file.originalname.replace(
      ".json",
      ""
    );

    const targetPath = path.join(
      __dirname,
      "MedRoPax-Solver",
      originalFilename
    );
    const scriptPath = "./solver.py";
    const args = `${originalFilename} ${originalFileNameWithoutExt}_result.json`;

    const resultFilePath = path.join(
      __dirname,
      "MedRoPax-Solver",
      `${originalFileNameWithoutExt}_result.json`
    );

    const dirPath = path.join(
      __dirname,
      "MedRoPax-Solver",
      `${originalFileNameWithoutExt}_result`
    );
    console.log(resultFilePath);

    console.log(`Running python script: python ${scriptPath} ${args}`);

    exec(
      `python ${scriptPath} ${args}`,
      { cwd: "./MedRoPax-Solver" },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          return res.status(500).json({ success: false, error: error.message });
        }

        if (stderr) {
          console.warn(`Python stderr: ${stderr}`);
        }
        let result, problem;
        fs.readFile(resultFilePath, "utf8", (err, data) => {
          if (err) {
            console.error(`Error reading result file: ${err.message}`);
            return res.status(500).json({ success: false, error: err.message });
          }

          try {
            result = JSON.parse(data);
            fs.readFile(targetPath, "utf8", (err, data) => {
              if (err) {
                console.error(`Error reading result file: ${err.message}`);
                return res
                  .status(500)
                  .json({ success: false, error: err.message });
              }

              try {
                problem = JSON.parse(data);
                return res.json({
                  success: true,
                  problem,
                  result,
                  dirPath,
                });
              } catch (parseError) {
                console.error(
                  `Error parsing result file: ${parseError.message}`
                );
                return res
                  .status(500)
                  .json({ success: false, error: parseError.message });
              }
            });
          } catch (parseError) {
            console.error(`Error parsing result file: ${parseError.message}`);
            return res
              .status(500)
              .json({ success: false, error: parseError.message });
          }
        });
      }
    );
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ success: false, error: e.message });
  }
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
