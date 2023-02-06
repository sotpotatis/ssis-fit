/* lunchMenu.js
API wrapper for the Eatery Lunch API, which is available at
https://lunchmeny.albins.website/ */
import {DateTime} from "luxon";

export class LunchMenuAPI {
    constructor(restaurantName, baseURL="https://lunchmeny.albins.website") {
        this.restaurantName = restaurantName
        this.baseURL = baseURL
    }

    /**
     * Gets and returns the week menu.
     * @param weekNumber The week number to get the menu for.
     * @param callback A callback function that will receive the final data or null if the request faiked.
     */
    getWeekMenu(weekNumber, callback){
        // Build request URL
        const url  = `${this.baseURL}/api/${this.restaurantName}/${weekNumber}`
        console.log(`Getting menu for week ${weekNumber} (from URL ${url})...`)
        fetch(url).then( // Convert response into JSON
            (response) => {
                return response.json()
            }
        ).then(
            function(json){
                console.log("Received response JSON from Eatery API. Sending to callback...")
                callback(json)
            }
        ).catch((error) => {
            console.log(`Caught error ${error} in request.`)
            callback(null)
        }
        )
    }

    /**
     * Shortcut function to getWeekMenu that gets the menu for the current week.
     * @param callback A callback function that will receive the final data.
     */
    getCurrentWeekMenu(callback){
        const currentWeek = DateTime.now().weekNumber
        this.getWeekMenu(currentWeek, callback)
    }
}