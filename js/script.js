/*
Version: 1.0.0

URLs Saver is a simple Chrome extension that allows to save the tabs open in
the current browser window and to re-open them at any time.

Author: Alessandro Ferro
*/


/**
 * Ignores the default 'new tab' opened by Chrome.
 * Creates an array with the url of the open tabs.
 * Overwrites the array to the Chrome storage.
 */
function saveToStorage() {

    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => { 
        if (typeof(Storage) !== "undefined") {
            if (tabs.length < 2 && tabs[0].url == "chrome://newtab/") {
                showToast("No tabs to save");
            } else {
                var taburls = [];
                for(let i=0; i<tabs.length; i++) {
                    taburls.push(tabs[i].url);
                }
                localStorage.clear();
                localStorage.setItem("url", JSON.stringify(taburls));
                showToast("Tabs saved");
                // console.log(JSON.stringify(taburls));
            }
          } else {
            document.getElementById("userActions").innerHTML = "Local storage not supported";
          }
    });  
}

/**
 * Stores the url from local storage in an array.
 * Closes the default 'new tab' opened by Chrome.
 * Checks the array against the url of the open tabs and eliminates duplicates.
 * Opens new tabs with the url in the array.
 */
function retrieveTabs() {
    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem("url") != null) {
            var storedTabs = JSON.parse(localStorage.getItem("url"));
            
            chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
                if(tabs[0].url == "chrome://newtab/") {
                        chrome.tabs.remove(tabs[0].id);
                    }
                
                for (let i=0; i<storedTabs.length; i++) {
                    for (let j=0; j<tabs.length; j++) {
                        if (storedTabs[i] == tabs[j].url) {
                            storedTabs.splice(i, 1);
                        }
                    }
                }

                if (storedTabs.length > 0) {
                    for(let i=0; i<storedTabs.length; i++) {
                        chrome.tabs.create({url: storedTabs[i]});
                        console.log(storedTabs[i]);
                    }
                } else {
                    showToast("Tabs already open.");
                } 
            });
        } else {
            showToast("No tabs saved");
        }
    } else {
        document.getElementById("userActions").innerHTML = "Local storage not supported";
    }
    
}

/**
 * Asks for user's confirmation before clearing the storage.
 */
function clearStorage() {
    if (typeof(Storage) !== "undefined") {
        if(localStorage.getItem("url") != null) {
            var userConfirm = confirm("Press 'OK' to delete or 'Cancel' to go back");
            if (userConfirm == true) {
                localStorage.clear();
                showToast("Tabs deleted");
            } else {
                return;
            }
            
        } else {
            showToast('Storage is empty');
        }
    } else {
        document.getElementById("userActions").innerHTML = "Local storage not supported";
    }
}

/**
 * Creates a toast message
 * 
 * In alternative, Chrome allows to create system notifications. To use them:
 * -> Add 'notifications' to the permissions in manifest.json
 * -> Create 'notifications.js' with following code
 *      chrome.notifications.create("", {
 *                              type: "basic",
 *                              iconUrl: "../favicon.png",
 *                              title: "***",
 *                              message: "***"});
 */
function showToast(msg) {
    var toast = document.getElementById("toast");
    toast.className = "show";

    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
    document.getElementById("toastMsg").innerHTML = msg;
}

/* Function calls */
document.getElementById("saveBtn").addEventListener("click", saveToStorage);
document.getElementById("fireUpBtn").addEventListener("click", retrieveTabs);
document.getElementById("clearBtn").addEventListener("click", clearStorage);