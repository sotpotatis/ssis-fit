/* userInterfaceHandler.js
Code I wrote for handling the user interface,
to make it easier to handle and switch between multiple screens.
I'll probably reuse this in other FitBit projects.
Due to the way that FitBit's document API works (no .innerHTML, no .appendChild :((),
I changed a lot of the code here. Initially thought as a React-like component framework,
it became a simple but helpful View class together with a handler that loads and unloads
user interfaces.
*/
import * as document from "document";

/**
 * Creates a view, which is a reference to a .view .svg file in the resources/ folder.
 */
export class View {
    /**
     * Initializes a view (a unique screen which is a  wrapper that includes components)
     * @param id The ID of the view. Must match index.view.
     * @param helperFunctions Any helper functions related to the view to help out when rendering.
     * These may be accessed via the code later.
     */
    constructor(id, helperFunctions=null) {
        this.id = id
        if (helperFunctions === null){
            helperFunctions = {}
        }
        this.helperFunctions = helperFunctions
    }
    /**
     * Function to render and display every element the view
     * @param afterRender: Function to run after the page was displayed/rendered. Here is where you'll do things
     * like dynamically filling out content, etc.
     */
    render(afterRender) {
        // Load the view from the resources/ folder and replace the currently active one.
        console.log(`Rendering view ${this.id}...`)
        const viewName = `./resources/${this.id}.view`
        document.location.replace(viewName).then(()=> {
            console.log(`View rendered. Running afterRender...`)
            afterRender()
        })
    }
}

/**
* Handles the rendering of the current user interface as well as switching
* between user interfaces.
*/
export class UserInterfaceHandler {
    /**
     * Creates a user interface handler.
     * @param userInterfaces A dictionary of IDs mapping to View()-class app views/userinterfaces
     * that you want to switch between.
     */
    constructor(userInterfaces) {
        this.userInterfaces = userInterfaces
        this.activeView = null
        this.previousView = null
        this.previousAfterRender = null
        this.numberOfViewSwitches = 0
    }
    setActiveUserInterface(userInterfaceId, afterRender=null){
        console.log(`Changing user interface to ${userInterfaceId}...`)
        const userInterfaceToRender = this.userInterfaces[userInterfaceId]
        this.activeView = userInterfaceId
        this.numberOfViewSwitches += 1
        userInterfaceToRender.render(() => {
            if (typeof afterRender === "function"){
                console.log("Running after render...")
                afterRender()
            }
            console.log("Handling back button...")
            new BackButton(this.setActiveUserInterface, this.previousView, this.previousAfterRender).displayBackButton()
            this.previousAfterRender = afterRender
            this.previousView = this.activeView
        })
    }
}