#!/usr/bin/env node

import * as os from "os";
import * as child_process from "child_process";
import { exec } from "child_process";
import * as fs from "fs";
import path from "path";

async function indexer(keyword: string, vols?: string | undefined) {
  if (vols !== "vols" && vols !== undefined) {
    console.log("Invalid argument");
    return;
  }

  const INDEXED_DRIVES_FILE = path.join(
    os.homedir(),
    "Desktop",
    "DriveIndexer.nosync"
  );

  let rawData;
  try {
    const stdout = child_process.execSync(
      `grep -ri "${keyword}" ${INDEXED_DRIVES_FILE} | cut -d ':' -f 2-`
    );
    rawData = stdout.toString();
  } catch (error) {
    console.error(`exec error: ${error}`);
  }

  if (!rawData) {
    console.log("No data found");
    return;
  }

  if (!vols) {
    // Split rawData into lines
    const lines = rawData.split("\n");

    // Extract directory paths and truncate at the folder containing the keyword
    const directories = lines.map((line) => {
      const index = line.toLowerCase().indexOf(keyword.toLowerCase());
      return line.substring(0, index + keyword.length);
    });

    // Group directories by volume
    const volumes: { [key: string]: Set<string> } = {};
    for (const dir of directories) {
      const parts = dir.split("/");
      const volume = parts[2];
      if (volume) {
        if (!volumes[volume]) {
          volumes[volume] = new Set();
        }
        volumes[volume].add(dir);
      }
    }
    console.log(volumes);
  }

  if (vols === "vols") {
    // Split rawData into lines
    const lines = rawData.split("\n");

    // Extract directory paths and truncate at the volume name
    const directories = lines.map((line) => {
      const parts = line.split("/");
      return parts[2];
    });

    // Remove duplicates
    const uniqueDirectories = [...new Set(directories)].filter(
      (volume) => volume !== undefined
    );

    console.log(uniqueDirectories);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
indexer(args[0], args[1]);
