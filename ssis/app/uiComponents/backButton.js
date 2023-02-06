/* backButton.js
A helper which implements a "back button" functionality for switching between views.
Backswipes and back buttons have not been implemented yet,
but since it is something that would be cool to resolve, I thought I would
keep my efforts to try to make it work */
export default class BackButton {
    constructor(setActiveUserInterface, previousView, previousAfterRender) {
        this.previousView = previousView
        this.previousAfterRender = previousAfterRender
        this.setActiveUserInterface = setActiveUserInterface
    }
    /**
     * Checks if there is a page to go back to or not.
     * @returns {boolean}
     */
    backButtonAvailable(){
        const backButtonAvailable = this.previousView !== null
        console.log(`Back button available: ${backButtonAvailable}`)
        return backButtonAvailable
    }
    /**
     * Goes back to the previous page if available
     */
    goBack() {
        if (this.backButtonAvailable()){
            console.log("Going back a page...")
            this.setActiveUserInterface(
                this.previousView,
                this.previousAfterRender
            )
        }
        else {
            console.log("No previous page is available. Will not go back a page.")
        }
    }

    /**
     * Checks whether a back button should be displayed, and displayed it if so.
     * The back button should be created on the page, but with display=none.
     */
    displayBackButton(backButtonId="back-button"){
        const backButtonElement = document.getElementById(backButtonId)
        const backButtonIcon = document.getElementById(`${backButtonId}-icon`)
        if (this.backButtonAvailable()){
            console.log("Showing back button on page...")
            backButtonElement.style.display = "inline"
            backButtonIcon.addEventListener("click", ()=>{
                console.log("Back button was clicked!")
                this.goBack()
            })
        }
        else {
            console.log("Back button will not be shown (nothing previous to go back to)")
        }

    }
}