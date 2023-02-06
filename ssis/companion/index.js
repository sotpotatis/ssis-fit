/* index.js
Main companion code.
Runs in the background in the FitBit app to perform tasks such as
downloading the schedule.js and the day menu. */
import { me as companion } from "companion"
import * as messaging from "messaging";
import { settingsStorage } from "settings";
import {requestLunch, requestSchedule, statusError, statusOk} from "../common/constants";
import ScheduleAPI from "./libraries/schedule/schedule";
import {sendMessageIfOpen} from "../common/messages";
import {LunchMenuAPI} from "./libraries/lunchMenu/lunchMenu";
import {lunchMenuDays} from "../common/constants";
import { getCurrentDayIndex } from "../common/sharedFunctions";

console.log("...:::FITBIT SSIS COMPANION:::...")

// Check permissions
if (!companion.permissions.granted("run_background")){
    console.warn("The app is not granted to run in the background.")
}

// To communicate the responses to the app (running on the FitBit) itself, we're
// using FitBit's messaging.js API.

// On open
messaging.peerSocket.onopen = () => {
    console.log("The socket connection was opened.")
    // Check permissions and send error if we are missing any
    if (!companion.permissions.granted("access_internet")){
        console.warn("Missing permission to access internet!")
        sendMessageIfOpen(generateErrorMessage("Behörighet för internetåtkomst inaktiverad. Slå på den i inställningar."))
    }
}

// On message: Send whatever is requested
messaging.peerSocket.onmessage = (event) => {
    const message = event.data
    console.log(`Received message with keys ${Object.keys(message)}`)
    if (message.request === requestSchedule){
        console.log("Schedule was requested. Retrieving and sending...")
        sendScheduleInformation()
    }
    else if (message.request === requestLunch) {
        console.log("Lunch was requested. Retrieving and sending...")
        sendLunchInformation()
    }
}

/**
 * Function to generate a message that includes error info etc.
 * @param status Request status.
 * @param content Any content to include.
*/
function generateMessage(status, content){
    content.status = status
    return content
}

/**
 * Adds a success status to a message.
 * @param content The message content.
 * @returns {*}
 */
function generateSuccessMessage(content){
    return generateMessage(statusOk, content)
}

/**
 * Generates an error with a specified message.
 * @param errorMessage An error message describing the error.
 * @returns {*}
 */
function generateErrorMessage(errorMessage){
    return generateMessage(statusError, {
        message: errorMessage
    })
}

/**
* Function to get and send schedule information to the app.
*/
function sendScheduleInformation(){
    console.log("Getting and sending schedule information...")
    const scheduleAPI = new ScheduleAPI()
    const roomNameOption = JSON.parse(settingsStorage.getItem("room"))
    console.log(settingsStorage.getItem("room"))
    if (roomNameOption === null){ // Validate that room is set
        console.log("No room name set. Sending error message...")
        sendMessageIfOpen(generateErrorMessage("Ställ in din klass i inställningarna för appen i Fitbit's app."))
        return
    }
    const roomName = roomNameOption.values[0].value // Get room name from multi-choice view
    try {
        scheduleAPI.getSchedule(roomName, function(events){
        console.log("Companion received schedule information", events)
        if (events === null){
            console.log("Event retrieval failed. Sending error...")
            sendMessageIfOpen(generateErrorMessage("Ajdå! Ett fel inträffade när schemat skulle hämtas. Är du säker på att du valt rätt klass och att du har lektioner idag?"))
        }
        // We are only interested in the events that are not all-day (such as homework announcements etc.). Send that.
        const scheduleEvents = events.scheduleEvents
        if (scheduleEvents.length > 0){
            console.log("Sending schedule events for today...")
            sendMessageIfOpen(generateSuccessMessage({data: scheduleEvents, responseType: requestSchedule}))
        }
        else {
            console.log("No events found for today. Sending error message...")
            sendMessageIfOpen(generateErrorMessage("Inga lektioner hittades för idag. Är det helg eller lov?"))
        }
    })
    }
    catch (e) {
        console.warn(`Schedule request failed with error ${e}.`)
        sendMessageIfOpen(generateErrorMessage(`Ett fel inträffade :c Felinfo: ${e}.`))
    }
}

function sendLunchInformation(){
    console.log("Getting and sending lunch information...")
    const lunchMenuAPI = new LunchMenuAPI("kista-nod")
    try {
        lunchMenuAPI.getCurrentWeekMenu(function(data){
            console.log("Companion received lunch menu information", data)
            if (data === null){
                console.log("Error: Missing data!")
                sendMessageIfOpen(generateErrorMessage("Ingen meny för idag hittades."))
            }
            else if (data.status === "error"){
                console.log("Error: Status is error.")
                sendMessageIfOpen(generateErrorMessage(data.message))
            }
            else {
                console.log("Parsing data into lists...")
                // Create lists of menu items for different days
                // Display lunch menu for the current day
                const currentDayId = lunchMenuDays[getCurrentDayIndex()]
                const menuDays = data.menu.days // Get lunch menu for whole week
                console.log(`Current day: ${currentDayId}.`)
                if (Object.keys(menuDays).includes(currentDayId)){
                    console.log("Menu found for current day.")
                    const currentDayMenu = menuDays[currentDayId].dishes
                    console.log("Day menu data retrieved: ", JSON.stringify(currentDayMenu), ". Sending...")
                    sendMessageIfOpen(generateSuccessMessage({
                    data: currentDayMenu,
                    responseType: requestLunch
                }))
                }
                else {
                    console.log("No data available for current day.")
                    sendMessageIfOpen(generateErrorMessage("Ingen meny för idag hittades."))
                }

            }
        })

    }
    catch (e) {
        console.warn(`Lunch menu request failed with error ${e}.`)
        sendMessageIfOpen(generateErrorMessage(`Ett fel inträffade :c Felinfo: ${e}.`))
    }
}