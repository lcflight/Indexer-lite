# Indexer-lite

This is a highly simplified script to prove the viability of a hard drive watching and monitoring program to keep your company from ever having to search through dozens of hard drives for that one file again!

# Getting Started

    - Install pm2 globally
    ```npm i -g pm2```

    - Install project dependencies
    ```npm i```

    - Copy run.sh to /LocalDrive/Library/Scripts/DriveIndexer/run.sh

    - Copy com.arthur.DriveIndexer.plist to /LocalDrive/Library/LaunchAgents/com.arthur.DriveIndexer.plist

By default DriveIndexer stores index files to a folder on the desktop in a folder called 'DriveIndexer'. To update to a custom directory update script.ts lines 9-14. Also update the route referances in .zshrc.sample

    - In terminal run
        ```cd ~```
        ```nano ~/.zshrc```

    - Paste the contents of '.zshrc.sample' to the bottom of the file

    - Press 'CMD + X' then 'Y', then 'Enter'

    - In terminal run
        ```source ~/.zshrc```

Thats it! You are good to go! Just Restart your computer and Drive should begin indexing auto matically!
There may be some issues with permissions to sort out with i do not feel qualified to explain at this point.
