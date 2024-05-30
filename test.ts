#!/usr/bin/env node

import notifier from "node-notifier";

console.log("testscript started. sending yes/no notification");

notifier.notify({
  title: "Test Script",
  message: "Do you want to continue?",
  actions: ["Yes", "No"],
  wait: true,
});

// handle the action
notifier.on("action", (action) => {
  console.log("Action:", action);
  if (action === "Yes") {
    console.log("User clicked on Yes");
  } else {
    console.log("User clicked on No");
  }
});

console.log("testscript ended");
