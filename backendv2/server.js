const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "MedRoPax-Solver/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/read-pdf", (req, res) => {
  const { indexOfVehicle } = req.body;
  const pdfPath = path.join(
    __dirname,
    "MedRoPax-Solver/problem_result",
    `Loading-Plan-${indexOfVehicle}.pdf`
  );

  fs.exists(pdfPath, (exists) => {
    if (!exists) {
      return res
        .status(404)
        .json({ success: false, error: "PDF file not found" });
    }

    res.sendFile(pdfPath, (err) => {
      if (err) {
        console.error(`Error sending PDF file: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
      }
    });
  });
});

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
    let args = req.body;
    let argsString = "";

    if (args["--best-config-mode"] === "true") {
      argsString = "--best-config-mode true";
    } else {
      const filteredArgs = { ...args };

      if (filteredArgs["--insertion-mode"] === "best-fit") {
        delete filteredArgs["--construction-mode"];
      }

      argsString = Object.entries(filteredArgs)
        .map(([key, value]) => `${key} ${value}`)
        .join(" ");
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
    args = `--instance-filename ${originalFilename} --result-filename ${originalFileNameWithoutExt}_result.json ${argsString}`;

    const resultFilePath = path.join(
      __dirname,
      "MedRoPax-Solver",
      `problem_result.json`
    );

    const dirPath = path.join(
      __dirname,
      "MedRoPax-Solver",
      `${originalFileNameWithoutExt}_result`
    );

    console.log(args);

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
    return res.status(500).json({ success: false, error: e.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
