/* jshint esversion:6 */
/* globals jQuery, document, console, RenderTable, RenderChart */

var HitApi = (function ($) {

    var DOM = {};
    
    
    // cache DOM elements
    function cacheDom() {
        DOM.$inputForm = $('#input-form');
    }
    

    // bind events
    function bindEvents() {
        DOM.$inputForm.submit(getEvents);
    }


    // prepare events prior to calling renderers
    function prepareEvents(e) {
        return {
            type    : e.type,
            date    : e.created_at,
            actor   : e.actor.display_login,
            avatar  : e.actor.avatar_url,
            payload : e.payload
        };
    }

    
    // get github events
    function getEvents(author, repo) {
        
        var url= 'https://api.github.com/repos',
            repoEvents = `${url}/${author}/${repo}/events`;

        $.getJSON(repoEvents).then(handleResponse);
    }


    // handle GH JSON response data
    function handleResponse(response) {
        
        // we're splitting events into 3 categories, based on event type
        var commitTypes = ['PushEvent',
                           'CommitCommentEvent'
                          ],
            
            todoTypes = ['IssuesEvent',
                         'IssueCommentEvent',
                         'ProjectEvent',
                         'ProjectCardEvent',
                         'ProjectColumnEvent'
                        ],
            
            mergeTypes = ['CreateEvent',
                          'PullRequestEvent',
                          'PullRequestReviewEvent',
                          'PullRequestReviewCommentEvent'
                         ],
            
            // create array of commit-related events
            commitEvents = response
                .filter((e) => commitTypes.indexOf(e.type) !== -1)
                .map(prepareEvents),

            // create array of todo-related events
            todoEvents = response
                .filter((e) => todoTypes.indexOf(e.type) !== -1)
                .map(prepareEvents),

            // create build array of merge-related events
            mergeEvents = response
                .filter((e) => mergeTypes.indexOf(e.type) !== -1)
                .map(prepareEvents);
        
        // call renderers
        RenderTable.render(commitEvents, todoEvents, mergeEvents);
        RenderChart.render(response.map(prepareEvents));
    }
    
    
    // public init method
    function init() {
        cacheDom();
        bindEvents();
    }
    
    
    // return public methods
    return {
        init: init,
        getEvents: getEvents
    };

}(jQuery));
