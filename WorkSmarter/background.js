let startingMins = 5;
let currentTime = startingMins * 60;
let counter;
let ifTimerOver = false;
let urlStorage = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === "STOP_TIMER") {
    stopTimer();
    sendResponse({ time: currentTime, timerOver: ifTimerOver });
    resetTime();
    console.log("background.js - stop timer");
  } else if (request.cmd === "START_TIMER") {
    currentTime = request.when;
    startingMins = request.strarting;
    //storeCurrrentTime();
    storeStartingMins();
    startTimer();
    console.log("background.js - timer started");
  } else if (request.cmd === "GET_TIME") {
    sendResponse({
      time: currentTime,
      timerOver: ifTimerOver,
      startedMinutes: startingMins,
    });
    console.log("background.js - sending current time");
  } else if (request.cmd === "RESET_TIME") {
    clearInterval(counter);
    resetTime();
  } else if (request.cmd === "STORE_URL") {
    let tempURL = new URL(request.link);
    storeURL(tempURL);
  } else if (request.cmd === "GET_DATA") {
    sendResponse({ link: urlStorage });
  } else if (request.cmd === "CLEAR_URLs") {
    urlStorage = [];
  }
});

const blockedDomains = [
  "www.bbc.co.uk",
  "www.google.com",
  "www.facebook.com",
  "www.twitter.com",
];

function attemptInject(tab, tabId) {
  let testURL = new URL(tab.url);
  // if url is in the blocked domains list
  console.log(blockedDomains, testURL.hostname);
  if (blockedDomains.includes(testURL.hostname)) {
    console.log("execute content script");
    chrome.scripting.executeScript({
      files: ["contentscript.js"],
      target: { tabId: tabId },
    });
  } else {
    console.log("blocked domain");
  }
}

// call this when URL of current tab is changed to see if contentscript.js needs to be injected or not
try {
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log(changeInfo, tab);
    if (changeInfo.status == "complete") {
      // let testURL = new URL(tab.url);
      // if url is in the blocked domains list
      attemptInject(tab, tabId);
      // if (!testURL.origin.includes('chrome') && !tab.url.includes('google')) {
      //   if (changeInfo.status == 'complete') {
      //     chrome.scripting.executeScript({
      //       files: ['contentscript.js'],
      //       target: {tabId: tab.id}
      //     });
      //     console.log(testURL.hostname);
      //   }
      // } else {
      //   console.log('Invalid URL onUpdated');
      // }
    }
  });
} catch (e) {
  console.log(e);
}

// call this when the User changes tab and get the URL to see if contentscript.js needs to be injected or not
try {
  chrome.tabs.onActivated.addListener(function (activeInfo) {
    getCurrentTab();
  });
} catch (e) {
  console.log("ERROR HAPPENED");
  console.log(e);
}

///////////////   FUNCTIONS    /////////////////////////
function getCurrentTab() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    let tab_Id = tabs[0].id;
    try {
      attemptInject(tabs[0], tab_Id);
      // let urlConstr = new URL(url);
      // console.log(!urlConstr.origin.includes("chrome"));
      // console.log(!url.includes("google"));
      // if (!urlConstr.origin.includes("chrome") && !url.includes("google")) {
      //   console.log("execute content script");
      //   console.log(urlConstr.hostname);
      //   chrome.scripting.executeScript({
      //     files: ["contentscript.js"],
      //     target: { tabId: tab_Id },
      //   });
      //   console.log("changed content here");
      // } else {
      //   console.log("chrome:// or google.com, do nothing");
      // }
    } catch (e) {
      console.log("ERROR HAPPENED - " + e);
    }
  });
}

function startTimer() {
  counter = setInterval(UpdateCountDown, 1000);
  ifTimerOver = false;
}

function stopTimer() {
  clearInterval(counter);
  ifTimerOver = true;
  counter = null;
}

function resetTime() {
  startingMins = 5;
  currentTime = startingMins * 60;
  storeStartingMins();
  storeCurrrentTime();
  counter = null;
  //ifTimerOver = false; // why here false but true in the method above?
  clearLocalStorage();
}

function UpdateCountDown() {
  getCurrentTime();
  currentTime--;
  storeCurrrentTime();
  const mins = Math.floor(currentTime / 60);
  let secs = currentTime % 60;
  console.log(`TotalSeconds - ${currentTime}`);
  if ((mins == 0) & (secs == 0)) {
    clearInterval(counter);
    ifTimerOver = true;
  }
}

function storeURL(userURL) {
  let check = false;
  for (let i = 0; i < urlStorage.length; i++) {
    if (urlStorage[i] == userURL.hostname) {
      check = true;
      break;
    }
  }
  if (!check) {
    urlStorage.push(userURL.hostname);
    console.log("added url");
  }
}

function storeCurrrentTime() {
  chrome.storage.sync.set({ localTime: currentTime }, function () {
    console.log("storeCurrentTime - " + currentTime);
  });
}

function getCurrentTime() {
  chrome.storage.sync.get(["localTime"], function (data) {
    currentTime = data.localTime;
    console.log("getCurrentTime - " + data.localTime);
  });
}

function storeStartingMins() {
  chrome.storage.sync.set({ localStartingMins: startingMins }, function () {
    console.log("storeStartingMins - " + startingMins);
  });
}

function getStartingMins() {
  chrome.storage.sync.get(["localStartingMins"], function (data) {
    startingMins = data.localStartingMins;
    console.log("getStartingMins - " + data.localStartingMins);
  });
}

function clearLocalStorage() {
  chrome.storage.local.clear(function () {
    let error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });
}
