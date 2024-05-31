#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import { exec } from "child_process";
import klaw from "klaw";
import os from "os";

const INDEXED_DRIVES_FILE = path.join(
  os.homedir(),
  "Desktop",
  "DriveIndexer.nosync",
  "indexed_drives.json"
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

const indexDrive = async (drivePath: string) => {
  console.log("Indexing drive:", drivePath);
  const logFile = path.join(
    INDEXED_DRIVES_FILE + `${drivePath.replace(/\//g, "_")}_index.log`
  );
  const tempLogFile = logFile + ".tmp"; // Temporary log file
  const writeStream = fs.createWriteStream(tempLogFile);
  let itemsProcessed = 0;
  try {
    for await (const item of klaw(drivePath, {
      filter: (item) => {
        const isHidden = path.basename(item).startsWith(".");
        return !isHidden;
      },
    })) {
      if (!item.stats.isDirectory()) {
        writeStream.write(`${item.path}\n`);
        itemsProcessed++;
      }
    }
    console.log(
      `Finished indexing drive: ${drivePath}, processed ${itemsProcessed} items`
    );
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code !== "ENOENT"
    ) {
      console.log(
        `Error indexing drive: ${drivePath}. 'View detailed logs at script_error.log'`
      );
      console.error(err);
    }
  } finally {
    writeStream.end(() => {
      if (itemsProcessed > 0) {
        fs.renameSync(tempLogFile, logFile); // Replace the original log file with the temporary log file
      }
      if (fs.existsSync(tempLogFile)) {
        fs.unlinkSync(tempLogFile); // Delete the temporary log file
      }
    });
  }
};

const handleNewDrive = (drivePath: string) => {
  // Only handle volumes
  if (!drivePath.startsWith("/Volumes/")) {
    console.log("Ignoring drive:", drivePath);
    return;
  }

  // Delay the check to give the drive time to mount
  setTimeout(() => {
    if (!indexedDrives[drivePath]) {
      console.log("Drive not indexed yet:", drivePath);
      indexedDrives[drivePath] = true; // Update indexedDrives immediately
      saveIndexedDrives(indexedDrives);
      indexDrive(drivePath);
    } else {
    }
  }, 5000); // Delay of 5 seconds
};

let connectedDrives: { [key: string]: boolean } = {};

export function reindexDrives() {
  setInterval(() => {
    console.log("✅ Starting to reindex drives...");
    Object.keys(indexedDrives).forEach((drive) => {
      if (connectedDrives[drive]) {
        console.log("Re-indexing drive:", drive);
        indexDrive(drive);
      } else {
        console.log("Drive not connected, skipping reindex:", drive);
      }
    });
  }, 100000);
}

export function monitorDrives() {
  console.log("Starting to monitor drives...");
  setInterval(() => {
    console.log("Checking for new drives...");
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

      // Check for new drives
      volumes.forEach((volume) => {
        if (!connectedDrives[volume] && volume.startsWith("/Volumes/")) {
          console.log("New drive detected:", volume);
          connectedDrives[volume] = true;
          indexedDrives[volume] = true;
          indexDrive(volume);
        }
      });

      // Check for disconnected drives
      Object.keys(connectedDrives).forEach((drive) => {
        if (!volumes.includes(drive)) {
          console.log("Drive disconnected:", drive);
          delete connectedDrives[drive];
        }
      });
    });
  }, 5000); // Check for new drives every 5 seconds
}

monitorDrives();
reindexDrives();
