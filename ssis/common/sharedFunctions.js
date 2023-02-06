/* sharedFunctions.js
Some functions shared between the companion and the app. */

/**
 * Gets the current index (0-6) of the current weekday, where 0 is monday and 6 is sunday.
 * @returns {*} An integer of the current index.
 */
export function getCurrentDayIndex(){
    const dayNumber = new Date().getDay()
    // Switch so day 0 = monday, 6 = sunday
    return dayNumber === 0 ? 6 : dayNumber -1
}

/**
 * Gets the current day name, localized and everything.
 */
export function getCurrentDayName(){
    const formatOptions = {"weekday": "long"}
    const currentDate = new Date()
    return new Intl.DateTimeFormat("se-SV", formatOptions).format(currentDate)
}