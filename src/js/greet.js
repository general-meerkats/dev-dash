/* jshint esversion:6 */
/* globals $, console, LS */

var Greet = (function() {
    
    // init vars
    var defaultNames = [
            'pal',
            'sexy',
            'cool guy',
            'dork',
            'classy'
        ],
        dummy = selectName();
    
    
    // pick a name from defaults
    function selectName() {
        var ind = Math.floor(Math.random() * defaultNames.length);
        return defaultNames[ind];
    }
    
    
    // asign time-based message to 'greet' on initial load
    function getMessage() {
        var timeOfDay,
            tehDate = new Date(),
            initialHour = tehDate.getHours(),
            userName;
        
        // check for local storage & whether userName is undefined 
        if (LS.getData('momentum-settings') && LS.getData('momentum-settings').userName !== undefined) {
            userName = LS.getData('momentum-settings').userName;
        } else {
            userName = dummy;
        }
        
        if (initialHour < 12) {
            timeOfDay = "Morning";
        } else if (initialHour >= 12 && initialHour < 17) {
            timeOfDay = "Afternoon";
        } else {
            timeOfDay = "Evening";
        }

        return `Good ${timeOfDay}, ${userName}.`;
    }
    

    // render message to DOM
    function displayMessage() {
        $('#greeting').text(getMessage());
    }
    
    
    // public init method
    function init() {
        displayMessage();
    }
    
    
    // export public methods
    return {
        init: init
    };
    
}());
