/* index.js
Main code for the app (running on the FitBit). Relying on the companion to get data.
*/
import * as messaging from "messaging";
import { sendMessageIfOpen } from "../common/messages";
import * as document from "document";
import { me as device } from "device";
import {
  statusOk,
  statusError,
  requestLunch,
  requestSchedule,
  cacheInterval,
  validRequests,
  lunchMenuDays,
  lunchMenuDayNames,
  requestToReadable,
} from "../common/constants";
import {
  UserInterfaceHandler,
  View,
} from "./uiComponents/userInterfaceHandler";
import { getCurrentDayName } from "../common/sharedFunctions";

// Define some stuff. We need to define a handler for the views we'll use.
const uiViews = {
  lunchScreen: new View("lunchScreen"),
  loadingScreen: new View("loadingScreen", {
    setLoadingMessage: (message) => {
      console.log(`Setting loading screen message...`);
      document.getElementById("loading-message").text = message;
      console.log("Loading screen message set.");
    },
  }),
  scheduleScreen: new View("scheduleScreen"),
  errorScreen: new View("errorScreen", {
    setErrorMessage: (message) => {
      console.log(`Setting error screen message...`);
      document.getElementById("error-message").text = message;
      console.log("Error screen message set.");
    },
  }),
  titleScreen: new View("titleScreen"),
};
const uiHandler = new UserInterfaceHandler(uiViews);

// We also define a place to save lunch menu and schedule data
let data = {
  lunch: {
    data: [],
    savedAt: null,
  },
  schedule: {
    data: [],
    savedAt: null,
  },
};

/**
 * Checks whether the data type is saved/cached (in the data variable) or not.
 * @param dataType The data type, for example lunchMenu.
 * @returns {boolean}
 */
function checkCacheAvailable(dataType) {
  return (
    data[dataType].savedAt !== null &&
    Date.now() - data.lunchMenu.savedAt < cacheInterval
  );
}

/**
 * Callback function for when one of the title screen buttons (to choose either from the schedule
 * or from lunch menu view) is clicked.
 * @param buttonType: The event source/type of button that was clicked: "schedule" or "lunch"
 */
function onTitleScreenButtonClick(buttonType) {
  console.log(`Rendering ${buttonType}...`);
  // Check that the request (the eventSource) is a valid one that the code can understand
  if (buttonType in validRequests) {
    throw new Error(`Can not understand request ${buttonType}!`);
  }
  const sourceAlreadyAvailable = checkCacheAvailable(buttonType);
  if (!sourceAlreadyAvailable) {
    console.log(`Requesting ${buttonType} from companion...`);
    renderLoading(`Hämtar värden för ${requestToReadable[buttonType]}...`);
    sendMessageIfOpen({
      request: buttonType,
    });
  } else {
    console.log(`Rendering cached ${buttonType}...`);
    if (buttonType === requestSchedule) {
      renderSchedule();
    } else if (buttonType === requestLunch) {
      renderLunchMenu();
    }
  }
}

// Create functions for rendering lunch menu...
/**
 * Renders the lunch menu UI on the screen
 */
function renderLunchMenu() {
  uiHandler.setActiveUserInterface("lunchScreen", () => {
    // Render lunch menu data
    const dayMenu = data.lunch.data;
    console.log(`Rendering lunch menu with ${dayMenu.length} items...`);
    // Here, Fitbit's "tile list pool" is used.
    const menuListPool = document.getElementById("lunchMenuItems");
    menuListPool.delegate = {
      // This function is according to the docs. It returns information
      // about a tile.
      getTileInfo: (index) => {
        return {
          type: "lunchMenuItemsPool",
          value: dayMenu[index],
          index: index,
        };
      },
      // This function is called when the tile is ready to render,
      // and it configures its values.
      configureTile: (tile, info) => {
        if (info.type === "lunchMenuItemsPool") {
          console.log(
            `Setting text of tile ${info.index} in pool to ${info.value}`,
          );
          tile.getElementById("text").text = info.value;
        }
      },
    };
    menuListPool.length = dayMenu.length;
    menuListPool.redraw();
    console.log(`Rendered ${menuListPool.length} day menu items.`);
  });
}
// ...  and schedule...
/**
 * Renders the schedule UI on the screen.
 */
function renderSchedule() {
  uiHandler.setActiveUserInterface("scheduleScreen", () => {
    // Render schedule
    const schedule = data.schedule.data;
    console.log(`Rendering schedule with ${schedule.length} items...`);
    // Here, Fitbit's "tile list pool" is used. See renderLunchMenu()
    const scheduleListPool = document.getElementById("scheduleItems");
    scheduleListPool.delegate = {
      getTileInfo: (index) => {
        return {
          type: "scheduleItemsPool",
          value: schedule[index],
          index: index,
        };
      },
      configureTile: (tile, info) => {
        if (info.type === "scheduleItemsPool") {
          const handleUnknownValue = (input) => {
            // Replaces any unknown values (null or empty list/object) with "--"
            if (input === null) {
              return "--";
            } else if (typeof input === "object" || input.length === 0) {
              return "--";
            } else {
              return input;
            }
          };
          console.log(
            `Rendering schedule item ${JSON.stringify(info.value)}...`,
          );
          // Get elements in the tile and set them
          tile.getElementById("subject").text = handleUnknownValue(
            info.value.subject,
          );
          // Note: Below are considered details and they should be ignored for all-day items,
          // but .display = "none" doesn't seem to work with Fitbit's tile view.
          // A TODO is to display all-day events (homework events etc.) more clearly.
          // if (info.value.isAllDay){
          //   tile.getElementById("detailed-information").display = "none"
          // }
          tile.getElementById("times").text = `${handleUnknownValue(
            info.value.start,
          )}-${handleUnknownValue(info.value.end)}`;
          tile.getElementById("room").text = handleUnknownValue(
            info.value.room,
          );
          tile.getElementById("teacher").text = handleUnknownValue(
            info.value.teachers.join(","),
          );
          console.log("Schedule item rendered.");
        }
      },
    };
    // Set length and redraw
    scheduleListPool.length = schedule.length;
    // Scroll to the active schedule item
    let activeScheduleItemTileIndex = 0;
    for (let i = 0; i < schedule.length; i++) {
      if (!schedule[i].hasPassed) {
        break;
      }
      activeScheduleItemTileIndex = i;
    }
    scheduleListPool.value = activeScheduleItemTileIndex;
    console.log(
      `Rendered ${scheduleListPool.length} items and scrolled to the active schedule item (${activeScheduleItemTileIndex}).`,
    );
  });
}
// ...and for errors...
/**
 * Renders an error on the screen.
 * @param errorMessage The error message to show.
 */
function renderError(errorMessage) {
  uiHandler.setActiveUserInterface("errorScreen", () => {
    uiViews.errorScreen.helperFunctions.setErrorMessage(errorMessage);
  });
}
// ...and of course for the title screen!...
/**
 * Renders the title screen / app home screen
 */
function renderTitleScreen() {
  uiHandler.setActiveUserInterface("titleScreen", () => {
    document.getElementById("lunch-button").addEventListener("click", () => {
      onTitleScreenButtonClick(requestLunch);
    });
    document.getElementById("schedule-button").addEventListener("click", () => {
      onTitleScreenButtonClick(requestSchedule);
    });
  });
}
// ...and the loading screen!
/**
 * Renders the loading screen.
 * @param message The message to show in the loading screen
 */
function renderLoading(message) {
  uiHandler.setActiveUserInterface("loadingScreen", () => {
    uiHandler.userInterfaces.loadingScreen.helperFunctions.setLoadingMessage(
      message,
    );
    // Allow a timeout of 15 seconds before requiring data
    const originalNumberOfViewSwitches = uiHandler.numberOfViewSwitches; // To ensure that the user just doesn't happen to be on the loading screen for another occasion
    setTimeout(() => {
      if (
        uiHandler.numberOfViewSwitches === originalNumberOfViewSwitches &&
        uiHandler.activeView === "loadingScreen"
      ) {
        console.log("Caught loading screen timeout.");
        renderError(
          "Timeout för att hämta data uppnåddes. Kolla att din mobil är i närheten.",
        );
      }
    }, 15000);
  });
}
renderTitleScreen(); // Start with showing the title screen!

// We are using the FitBit messaging.js API for connection between the app and the companion.
// Here, we initialize the communication.
messaging.peerSocket.onmessage = (event) => {
  /**
   * Handler for taking care of a received message. There is code implemented for splitting a list of
   * data into separate parts. This function saves incoming messages in the "data"-variable and runs callbacks
   * based on the received message.
   * @param type The type of the received data.
   * @param message The message that was received.
   * @param doneCallbacks An object with mappings from type to function to run when data has been received.
   */
  function cacheData(type, message, doneCallbacks) {
    // Sometimes, we might need to send multiple messages since there
    // is a max message size.
    // We take use of a part attribute and a totalDataEntries (length of message.data)
    // for handling this check
    if (message.part !== undefined) {
      data[type].data.push(...message.data); // Add data part
    } else {
      data[type].data = message.data; // If the data is not split, just set it directly
    }
    // If the correct length has been achieved
    if (
      message.totalDataEntries === undefined ||
      data[type].data.length === message.totalDataEntries
    ) {
      console.log(`Received all data for ${type}.`);
      data[type].savedAt = Date.now();
      // Run callbacks
      if (doneCallbacks[type] !== undefined) {
        console.log(`Running callback for ${type}...`);
        doneCallbacks[type]();
      }
    }
  }
  const message = event.data;
  console.log(`App received a message with keys ${Object.keys(message)}`);
  const dataReceivedCallbacks = {
    lunch: renderLunchMenu,
    schedule: renderSchedule,
  };
  if (message.status === statusOk) {
    console.log("The status is ok!");
    // Check what we received
    if (message.responseType === requestSchedule) {
      console.log("We received the schedule.");
      cacheData(requestSchedule, message, dataReceivedCallbacks);
    } else if (message.responseType === requestLunch) {
      console.log("We received the lunch menu.");
      cacheData(requestLunch, message, dataReceivedCallbacks);
    } else {
      console.warn(
        `Received unknown/unparseable response type ${message.responseType} from companion!`,
      );
      renderError(`Oförstådd responstyp " ${message.responseType}" :c`);
    }
  } else {
    console.warn("The message status is error! Displaying error...");
    // Error messages will have the key {message: ""} to tell us what has gone wrong, so render it
    renderError(message.message);
  }
};
// Prevent unload to allow backswipe to navigate between views
document.addEventListener("beforeunload", (event) => {
  event.preventDefault();
});
