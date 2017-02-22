/* jshint esversion:6 */
/* globals jQuery, document, console, LS, RepoSelect */

var Greet = (function($) {
    
    var name,
        githubName,
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
        DOM.$greeting    = $('.greeting');
        DOM.$overlay     = $('<div id="overlay"></div>');
        DOM.$modalPrompt = $(document.createElement('div'));
        DOM.$modalError  = $(document.createElement('p'));

        DOM.$modalPrompt
            .attr('id', 'user-modal')
            .addClass('user-modal')
            .html(modalForm);
        
        DOM.$modalError
            .addClass('user-modal-error')
            .html('GitHub Username Not Found');
        
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
        
        // set module scope names to input names
        name = e.currentTarget[0].value.trim();
        githubName = e.currentTarget[1].value.trim();
        
        checkUser(githubName)
            .then(function (res) {
                if (res.login === githubName) {
                    
                    // save user details to local storage
                    LS.setData('dev-dash-user', {
                        name     : e.currentTarget[0].value,
                        githubName : e.currentTarget[1].value
                    });

                    // retract the modal panel
                    hideModal();

                    // call display message
                    displayMessage();
                }
            })
            .catch(function (err) {
            
                // warn user
                DOM.$modalPrompt
                    .append(DOM.$modalError);
            
            });
    }
    
    
    // check Github username
    function checkUser(u) {
        return $.getJSON('https://api.github.com/users/' + u);
    }
    
    
    // assemble time-based message to greet user
    function makeMessage() {
        var timeOfDay,
            tehDate = new Date(),
            initialHour = tehDate.getHours();
        
        if (initialHour < 12) {
            timeOfDay = "morning";
        } else if (initialHour >= 12 && initialHour < 17) {
            timeOfDay = "afternoon";
        } else {
            timeOfDay = "evening";
        }

        return `Good ${timeOfDay}, ${name}.`;
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
            name = storage.name;
            githubName = storage.githubName;
            displayMessage();
        } else {
            showModal();
        }
    }
    

    // render DOM and call RepoSelect.getRepos()
    function displayMessage() {
        DOM.$greeting.text(makeMessage());
        RepoSelect.getRepos(githubName);
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
