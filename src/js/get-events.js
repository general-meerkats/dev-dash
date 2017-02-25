/* jshint esversion:6 */
/* globals jQuery, document, RenderTable, RenderChart */

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
            
            todoTypes   = ['IssuesEvent',
                           'IssueCommentEvent',
                           'ProjectEvent',
                           'ProjectCardEvent',
                           'ProjectColumnEvent'
                          ],
            
            mergeTypes  = ['CreateEvent',
                           'PullRequestEvent',
                           'PullRequestReviewEvent',
                           'PullRequestReviewCommentEvent'
                          ],
            
            // create arrays of related event types
            commitEvents = filterRes(response, commitTypes),
            todoEvents   = filterRes(response, todoTypes),
            mergeEvents  = filterRes(response, mergeTypes);
        
        // call renderers
        RenderTable.render(commitEvents, todoEvents, mergeEvents);
        RenderChart.render(response.map(prepareEvents));
    }
    
    
    /* filter responses by event type
     *
     * @params   [array]  res    [the whole JSON response array]
     * @params   [array]  types  [the specific event types to filter]
     * @returns  [array]         [filtered array of events]
    */
    function filterRes(res, types) {
        return res
            .filter((e) => types.indexOf(e.type) !== -1)
            .map(prepareEvents);
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
