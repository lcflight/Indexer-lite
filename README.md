# Indexer-lite

This is a highly simplified script to prove the viability of a hard drive watching and monitoring program to keep your company from ever having to search through dozens of hard drives for that one file again!

## Getting Started

1. **Install pm2 globally**

   Run the following command in your terminal:
   `npm i -g pm2`

2. **Install project dependencies**

   Run the following command in your terminal:
   `npm i`

3. **Copy run.sh**

   Copy `run.sh` to `/LocalDrive/Library/Scripts/DriveIndexer/run.sh`.

4. **Copy com.arthur.DriveIndexer.plist** to /LocalDrive/Library/LaunchAgents/com.arthur.DriveIndexer.plist

   Copy `com.arthur.DriveIndexer.plist` to `/LocalDrive/Library/LaunchAgents/com.arthur.DriveIndexer.plist`

By default DriveIndexer stores index files to a folder on the desktop in a folder called 'DriveIndexer'. To update to a custom directory update script.ts lines 9-14. Also update the route references in .zshrc.sample

5. **Update .zshrc**

   Run the following command in your terminal:
   `cd ~`
   `nano ~/.zshrc`

6. Paste the contents of '.zshrc.sample' to the bottom of the file

7. Press `CMD + X` then `Y`, then `Enter`

8. Source `.zshrc`

   Run the following command in your terminal:
   `source ~/.zshrc`

Thats it! You are good to go! Just Restart your computer and Drive should begin indexing automatically!
There may be some issues with permissions to sort out with I do not feel qualified to explain at this point.
