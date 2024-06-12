#!/usr/bin/env node

import * as os from "os";
import * as child_process from "child_process";
import { exec } from "child_process";
import * as fs from "fs";
import path from "path";

async function indexer(keyword: string, option?: string | undefined) {
  if (option !== "vols" && option !== "short" && option !== undefined) {
    console.log("Invalid argument");
    return;
  }

  const INDEXED_DRIVES_FILE = path.join(
    os.homedir(),
    "Desktop",
    "DriveIndexer"
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

  if (!option) {
    // Split rawData into lines
    const lines = rawData.split("\n");

    // Extract directory paths and truncate at the folder containing the keyword
    const directories = lines.map((line) => {
      const index = line.toLowerCase().indexOf(keyword.toLowerCase());
      const nextSlash = line.indexOf("/", index + keyword.length);
      const nextNewLine = line.indexOf("\n", index + keyword.length);
      let cutIndex = nextSlash !== -1 ? nextSlash : nextNewLine;
      if (cutIndex === -1) cutIndex = line.length;
      else cutIndex++;
      return line.substring(0, cutIndex);
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

  if (option === "short") {
    // Split rawData into lines
    const lines = rawData.split("\n");

    // Extract directory paths and truncate at the volume name
    const directories = lines.map((line) => {
      const parts = line.split("/");
      const volume = parts[2];
      const index = line.toLowerCase().indexOf(keyword.toLowerCase());
      const nextSlash = line.indexOf("/", index + keyword.length);
      const nextNewLine = line.indexOf("\n", index + keyword.length);
      let cutIndex = nextSlash !== -1 ? nextSlash : nextNewLine;
      if (cutIndex === -1) cutIndex = line.length;
      else cutIndex++;
      return {
        volume,
        path: volume + "/.../" + line.substring(index, cutIndex),
      };
    });

    // Group directories by volume
    const volumes: { [key: string]: Set<string> } = {};
    for (const dir of directories) {
      const volume = dir.volume;
      if (volume) {
        if (!volumes[volume]) {
          volumes[volume] = new Set();
        }
        volumes[volume].add(dir.path);
      }
    }
    console.log(volumes);
  }

  if (option === "vols") {
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
