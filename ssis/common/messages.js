/* messaging.js
Some shared functions related to messaging.
*/
import * as messaging from "messaging";

/**
 * Sends a message across the messaging API if it is open.
 * @param message The message to send.
 */
export function sendMessageIfOpen(message){
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN){

        // Bigger messages have the .data attribute so we can split them into parts
        // if needed
        let messages = null
        if (message.data !== undefined){
            messages = splitMessageIntoParts(message)
        }
        else {
            messages = [message]
        }
        for (const message of messages){
            console.log(`Sending message ${JSON.stringify(message)} to app...`)
            messaging.peerSocket.send(message)
        }
    }
}

function sizeOfStringBytes(string){
    return new Blob([JSON.stringify(string)]).size
}

export function splitMessageIntoParts(message){
    // We might need to split the message to achieve a certain size.
    let messageParts = []
    const totalDataEntries = message.data.length
    let currentMessage = null
    let currentDataIndex = -1 // Current iteration index of message.data
    let currentMessageSize = 0 // Current size of message
    let switchOutMessage = false
    console.log(`Sending message of ${totalDataEntries} data entries.`)
    while (currentDataIndex<totalDataEntries-1){
        console.log(`Current data index: ${currentDataIndex}. Total data entries: ${totalDataEntries}`)
        // Reset current message if needed
        if (currentMessage == null){
            console.log("Switching out message.")
            currentMessage = JSON.parse(JSON.stringify(message)) // Copy original message
            currentMessage.data = [] // Empty all data
            currentMessage.part = messageParts.length + 1
            currentMessage.totalDataEntries = totalDataEntries
        }
        currentMessageSize = sizeOfStringBytes(JSON.stringify(currentMessage))
        // Check if the current message has place for some more stuff
        if (currentMessageSize<messaging.peerSocket.MAX_MESSAGE_SIZE){
            const nextData = message.data[currentDataIndex+1]
            // Try to append data and see if we reach buffer
            currentMessage.data.push(nextData)
            const newMessageSize = sizeOfStringBytes(JSON.stringify(currentMessage))
            // If we reached the maximal size, stop
            if (newMessageSize>messaging.peerSocket.MAX_MESSAGE_SIZE){
                console.log("Buffer reached with a data element!")
                currentMessage.data.pop()
                switchOutMessage = true
            }
            else { // Increase index if we're good
                currentDataIndex += 1
                // Make sure that if we reach the last index, we switch out the message
                if (currentDataIndex === totalDataEntries-1){
                    switchOutMessage = true
                    console.log("Reached end, will switch out message.")
                }
            }
        }
        else { // We don't expect this error, so a handler is not implemented
            console.log("Buffer reached with base message size!")
            throw new Error("Meddelande för stort. Hantering inte implementerad.")
        }
        if (switchOutMessage){
            console.log("Switching out a message...")
            messageParts.push(currentMessage)
            currentMessage = null
        }
    }
    console.log(`Split a message into ${messageParts.length} parts.`)
    return messageParts
}