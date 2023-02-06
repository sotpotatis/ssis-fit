/* schedule.js
Exposes an API to get the schedule of a class
in Stockholm Science And Innovation School.
NOTE: Parts of this source code were translated from my Python API:
https://github.com/sotpotatis/SSIS-Schedule-Python/blob/main/ssis_schedule/Schedule.py
*/
import {DateTime} from "luxon";
const ROOMS_LOWERCASE = [
"arkaden",
"green corner",
"zelda",
"tetris",
"space invaders",
"donkey kong",
"pac-man",
"snake",
"monopol",
"domino",
"schack",
"go",
"plockepinn",
"backgammon",
"mastermind",
"yatzy"] // A list of all the rooms in the school in lowercase.

// Regexes
const classOrClassGroupRegex = new RegExp(/^(ssis- *)*(te[0-9]{2}[a-z]|hela skolan|individuella val)$/)
const teacherRegex = new RegExp(/^(ssis- *)*([a-z]{3})$/)
const pentryRegex = new RegExp(/^(ssis- *)*(pentry *[1-2])$/)
const roomsRegex = new RegExp(`^(ssis- *)*${ROOMS_LOWERCASE.join("|")}*$`)
const trimmingRegex = new RegExp(/\([0-9]{2,}\)/) // Trims end parentheses in a room
/**
 * The API by default provides a list of participants, but it does not provide what type they are.
 * We have to do that parsing ourselves.
 * @param participant The participant string.
 * @returns A list containing the participant type and the participant string. Some converters
 * format that string.
 */
function parseParticipant(participant){
    console.log(`Parsing participant string ${participant}...`)
    participant = participant.replace(trimmingRegex, "").trim()
    const participantLowercase = participant.toLowerCase()
    if (participant.length === 0){
        console.log("Ignoring participant with zero length.")
        return [null, null]
    }
    else if (participantLowercase.match(classOrClassGroupRegex)){
        console.log("Matched to be a class or group!")
        return ["class", participant]
    }
    else if (participantLowercase.match(roomsRegex)){
        console.log("Matched to be a room!")
        return ["room", participant]
    }
    else if (participantLowercase.match(teacherRegex)){
        console.log("Matched to be a teacher!")
        return ["teacher", participant]
    }
    else if (participantLowercase.match(pentryRegex)){
        console.log("Matched to be a pentry!")
        return ["pentry", participant]
    }
    else {
        console.warn(`Failed to match ${participantLowercase}'s participant type!`)
        return [null, null]
    }
}

export default class ScheduleAPI{
    constructor() {
    }

    /**
     * Gets the schedule for a "room name".
     * A room name is either a classroom name, a teacher name short (such as "REK"), or the name of a class (such as "TE20A").
     * @param roomName Either a classroom name, a teacher name short (such as "REK"), or the name of a class (such as "TE20A").
     * @param callback A callback function that will receive the final data or null if the request failed.
     */
    getSchedule(roomName, callback){
        console.log(`'Getting schedule for ${roomName}...`)
        const url = "https://api.ssis.nu/cal?room=" + roomName
        fetch(url, {
            "User-Agent": "JavaScript/FitbitSSIS<20alse@stockholmscience.se>" // Provide an identifiable user agent.
        }).then( // Convert response into JSON
            function(response){
                return response !== "" ? response.json() : null
            }
        ).then(
            function(json){
                console.log("Received response JSON from SSIS server. Converting into data...", json)
                let events = {
                    allDayEvents: [], // All day events such as homework etc.
                    scheduleEvents: [] // Schedule events (lessons)
                }
                if (json !== null){
                    console.log("Parsing received response...")
                    const now = DateTime.now()
                    for (const event of json){
                        const eventStartDateTime = DateTime.fromISO(event.start_time)
                        const eventEndDateTime = DateTime.fromISO(event.end_time)
                        let parsedEvent = {
                            subject: event.subject,
                            room: null,
                            teachers: [],
                            classes: [],
                            start: event.start_time,
                            end: event.end_time,
                            allParticipants: [],
                            isAllDay: eventStartDateTime-eventEndDateTime === 0 || (eventStartDateTime.hour < 7 && eventEndDateTime.length < 7),
                            hasPassed: now > eventEndDateTime
                        }
                        // Iterate over participants and parse them
                        console.log("Loaded base data", parsedEvent, ". Iterating over participants...")
                        for (const participant of event.participants.split(",")){
                            const [participantType, participantText] = parseParticipant(participant)
                            if (participantType !== null){
                                if (participantType === "room"){
                                    console.log(`Found a room: ${participantText}`)
                                    parsedEvent.room = participantText
                                }
                                else if (participantType === "teacher") {
                                    console.log(`Found a teacher: ${participantText}`)
                                    parsedEvent.teachers.push(participantText)
                                }
                                else if (participantType === "class") {
                                    console.log(`Found a class: ${participantText}`)
                                    parsedEvent.classes.push(participantText)
                                }
                                parsedEvent.allParticipants.push(participantText)
                            }
                        }
                        console.log("Done generating event: ", event + ". Adding to final data...")
                        if (!event.isAllDay){
                           events.scheduleEvents.push(parsedEvent)
                        }
                        else {
                            events.allDayEvents.push(parsedEvent)
                        }

                    }
                }
                else {
                    console.log("No data for today was found.")
                }
                console.log("Final events loaded were", events)
                callback(events)
            }
        ).catch((error)=>{
            console.log(`Encountered an error in the schedule request: ${error}.`)
            callback(null)
        })
    }
}