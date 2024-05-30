#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import { exec } from "child_process";
import klaw from "klaw";
import os from "os";

const INDEXED_DRIVES_FILE = path.join(
  os.homedir(),
  "Desktop",
  "DriveIndexer",
  ".indexed_drives.json"
);

console.log(INDEXED_DRIVES_FILE);

interface IndexedDrives {
  [key: string]: boolean;
}

const loadIndexedDrives = (): IndexedDrives => {
  console.log("Loading indexed drives...");
  if (fs.existsSync(INDEXED_DRIVES_FILE)) {
    const drives = fs.readJsonSync(INDEXED_DRIVES_FILE);
    console.log("Loaded indexed drives:", drives);
    return drives;
  }
  console.log("No indexed drives found.");
  return {};
};

const saveIndexedDrives = (drives: IndexedDrives) => {
  console.log("Saving indexed drives:", drives);
  fs.ensureDirSync(path.dirname(INDEXED_DRIVES_FILE));
  fs.writeJsonSync(INDEXED_DRIVES_FILE, drives);
};

let indexedDrives = loadIndexedDrives();

const indexDrive = (drivePath: string) => {
  console.log("Indexing drive:", drivePath);
  const logFile = path.join(
    INDEXED_DRIVES_FILE + `${drivePath.replace(/\//g, "_")}_index.log`
  );
  const writeStream = fs.createWriteStream(logFile);
  let itemsProcessed = 0;
  klaw(drivePath)
    .on("data", (item) => {
      if (!item.stats.isDirectory()) {
        writeStream.write(`${item.path}\n`);
      }
      itemsProcessed++;
    })
    .on("error", (err) => {
      console.error(`Error indexing drive: ${drivePath}`, err);
    })
    .on("end", () => {
      console.log(
        `Finished indexing drive: ${drivePath}, processed ${itemsProcessed} items`
      );
      if (itemsProcessed > 0) {
        writeStream.end();
      }
    });
};

const handleNewDrive = (drivePath: string) => {
  console.log("Handling new drive:", drivePath);
  // Only handle "/" directory and volumes
  if (drivePath !== "/" && !drivePath.startsWith("/Volumes/")) {
    console.log("Ignoring drive:", drivePath);
    return;
  }

  // Delay the check to give the drive time to mount
  setTimeout(() => {
    // Check if the drive exists before trying to index it
    // if (!fs.existsSync(drivePath)) {
    //   console.log("Drive does not exist, skipping:", drivePath);
    //   return;
    // }

    if (!indexedDrives[drivePath]) {
      console.log("Drive not indexed yet:", drivePath);
      indexedDrives[drivePath] = true; // Update indexedDrives immediately
      saveIndexedDrives(indexedDrives);
      indexDrive(drivePath);
    } else {
      console.log("Drive already indexed:", drivePath);
    }
  }, 5000); // Delay of 5 seconds
};

let seenDrives: { [key: string]: boolean } = {};

export function monitorDrives() {
  console.log("Starting to monitor drives...");
  setInterval(() => {
    exec("df -Hl", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      const volumes = stdout
        .split("\n")
        .filter((line) => line.startsWith("/dev/disk"))
        .map((line) => {
          const parts = line.split(/\s+/);
          return parts.slice(8).join(" "); // Join all parts from the 9th part onwards
        });
      volumes.forEach((volume) => {
        if (!seenDrives[volume]) {
          seenDrives[volume] = true;
          handleNewDrive(volume);
        }
        // Update the index of the drive every 10 minutes
        else {
          setTimeout(() => {
            indexDrive(volume);
          }, 600000); // 600000 milliseconds = 10 minutes
        }
      });
    });
  }, 5000); // Check for new drives every 5 seconds
}

monitorDrives();
