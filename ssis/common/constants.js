/* constants.js
Contains various constants relevant to multiple JavaScript files.
*/
// Status codes used in messaging.js
export const statusOk = "ok"
export const statusError = "error"
// Request codes used
export const requestLunch = "lunch"
export const requestSchedule = "schedule"
export const requestToReadable = {
    lunch: "lunchmeny",
    schedule: "schema"
}
export const validRequests = [requestLunch, requestSchedule]
// Data poll interval in seconds
export const cacheInterval = 120
// Lunch menu constants
export const lunchMenuDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
]
export const lunchMenuDayNames = [
    "Måndag",
    "Tisdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lördag",
    "Söndag"
]