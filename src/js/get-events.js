/* jshint esversion:6 */
/* globals $, document, console, RenderTable, RenderChart */

var HitApi = (function () {

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
            date    : formatDates(e.created_at),
            actor   : e.actor.display_login,
            avatar  : e.actor.avatar_url,
            payload : e.payload
        };
    }


    // format dates
    function formatDates(date) {

        return new Date(date)     // make date object for day & month abbrev
            .toDateString()       // convert object to a string
            .slice(0, 15)         // remove everything after the YYYY
            .replace(/ 0/g, ' '); // remove leading zeros (ex. '04' => '4')
    }

    
    // get github events
    function getEvents(e) {
        
        e.preventDefault();

        var api = {
            url   : 'https://api.github.com/repos',
            user  : e.currentTarget[0].value,
            repo  : e.currentTarget[1].value,
            route : 'events'
        };
        var repoEvents = `${api.url}/${api.user}/${api.repo}/${api.route}`;

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
        
//        console.log('Commit types: ' + commitEvents.length);
//        console.log('  Todo types: ' + todoEvents.length);
//        console.log(' Merge types: ' + mergeEvents.length);
        
        // call renderers
        RenderTable.render(commitEvents, todoEvents, mergeEvents);
        RenderChart.render(response.map(prepareEvents));
    }
    
    
    // public init method
    function init() {
        cacheDom();
        bindEvents();
    }
    
    
    // return public method
    return {
        init: init
    };

}());
