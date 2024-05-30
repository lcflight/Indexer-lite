#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import { exec } from "child_process";
import notifier from "node-notifier";

const INDEXED_DRIVES_FILE = path.join(
  process.env.HOME || "",
  ".indexed_drives.json"
);

interface IndexedDrives {
  [key: string]: boolean;
}

const loadIndexedDrives = (): IndexedDrives => {
  if (fs.existsSync(INDEXED_DRIVES_FILE)) {
    return fs.readJsonSync(INDEXED_DRIVES_FILE);
  }
  return {};
};

const saveIndexedDrives = (drives: IndexedDrives) => {
  fs.writeJsonSync(INDEXED_DRIVES_FILE, drives);
};

let indexedDrives = loadIndexedDrives();

const indexDrive = (drivePath: string) => {
  const logFile = path.join(
    process.env.HOME || "",
    `${drivePath.replace(/\//g, "_")}_index.log`
  );
  const writeStream = fs.createWriteStream(logFile);
  fs.walk(drivePath)
    .on("data", (item) => writeStream.write(`${item.path}\n`))
    .on("end", () => writeStream.end());
};

const updateDriveLog = (drivePath: string) => {
  indexDrive(drivePath); // Simplified, as it's similar to the indexDrive function
};

const showPopup = (drivePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    notifier.notify(
      {
        title: "New Drive Detected",
        message: `Index the drive ${drivePath}?`,
        actions: ["Yes", "No"],
        closeLabel: "No",
        timeout: 20,
      },
      (err, response, metadata) => {
        resolve(metadata.activationValue === "Yes");
      }
    );
  });
};

const handleNewDrive = async (drivePath: string) => {
  if (!indexedDrives[drivePath]) {
    if (await showPopup(drivePath)) {
      indexDrive(drivePath);
      indexedDrives[drivePath] = true;
      saveIndexedDrives(indexedDrives);
    }
  } else {
    updateDriveLog(drivePath);
  }
};

const monitorDrives = () => {
  setInterval(() => {
    exec("df -Hl", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      const volumes = stdout
        .split("\n")
        .filter((line) => line.startsWith("/dev/disk"))
        .map((line) => line.split(/\s+/)[8]);
      volumes.forEach((volume) => handleNewDrive(volume));
    });
  }, 5000); // Check every 5 seconds
};

monitorDrives();
