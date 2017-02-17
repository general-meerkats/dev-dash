/* jshint esversion:6 */
/* globals jQuery, document, console, LS */

var Greet = (function($) {
    
    var userName,
        DOM = {},
        
        // modal prompt template
        modalForm = `<form id="user-modal-form" class="Grid Grid--gutters Grid--1of2" action="submit">
                    <div class="Grid-cell InputAddOn">
                      <span class="InputAddOn-item">Your Name:</span>
                      <input id="user-modal-name" class="InputAddOn-field" type="text" required>
                    </div>
                    <div class="Grid-cell InputAddOn">
                      <span class="InputAddOn-item">GitHub User Name:</span>
                      <input id="user-modal-username"  class="InputAddOn-field" type="text" required>
                    </div>
                      <div class="Grid-cell InputAddOn">
                      <button class="InputAddOn-item" id="user-modal-button">Go!</button>
                    </div>
                    </form>`;
    
    
    // cache DOM elements
    function cacheDom() {
        DOM.$greeting    = $('#greeting');
        
        DOM.$overlay = $('<div id="overlay"></div>');
        
        DOM.$modalPrompt = $(document.createElement('div'));
        DOM.$modalPrompt
            .attr('id', 'user-modal')
            .addClass('user-modal')
            .html(modalForm);
        
        $('body')
            .append(DOM.$modalPrompt);
    }
    
    
    // bind events
    function bindEvents() {
        $('#user-modal-form').submit(handleSubmit);
    }
    
    
    // handle modal submit
    function handleSubmit(e) {
        e.preventDefault();
        
        // capture <input> values
        var name       = e.currentTarget[0].value,
            githubName = e.currentTarget[1].value;
        
        // set module scope userName to input 'name'
        userName = name;
        
        // save user details to local storage
        LS.setData('dev-dash-user', {
            name     : name,
            username : githubName
        });
        
        // retract the modal panel
        hideModal();
        
        // call display message
        displayMessage();
        
    }
    
    
    // assembly time-based message to greet user
    function makeMessage() {
        var timeOfDay,
            tehDate = new Date(),
            initialHour = tehDate.getHours();
        
        if (initialHour < 12) {
            timeOfDay = "Morning";
        } else if (initialHour >= 12 && initialHour < 17) {
            timeOfDay = "Afternoon";
        } else {
            timeOfDay = "Evening";
        }

        return `Good ${timeOfDay}, ${userName}.`;
    }
    
    
    // show modal panel. Slides down from top
    function showModal() {
        
        // show overlay
        DOM.$overlay.show();
        
        // show modal
        DOM.$modalPrompt
            .addClass('user-modal-show');
    }
    
    
    // retract modal panel
    function hideModal() {
        
        // show overlay
        DOM.$overlay.hide();
        
        // hide modal
        DOM.$modalPrompt
            .removeClass('user-modal-show');
    }
    
    
    // check local storage for user
    function checkStorage() {
        
        var storage = LS.getData('dev-dash-user');
        
        // if user found in local storage, go straight to greeting.
        // otherwise, show modal & prompt user for details
        if (storage && storage.name) {
            userName = storage.name;
            displayMessage();
        } else {
            showModal();
        }
    }
    

    // render DOM
    function displayMessage() {
        DOM.$greeting.text(makeMessage());
    }
    
    
    // public init method
    function init() {
        cacheDom();
        
        DOM.$overlay.hide();
        $('body').append(DOM.$overlay); // then append it to DOM
        
        bindEvents();
        
        checkStorage();
    }
    
    
    // export public methods
    return {
        init: init
    };
    
}(jQuery));
