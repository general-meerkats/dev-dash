/* jshint esversion:6 */
/* globals jQuery, document */

var RenderTable = (function ($) {

    var DOM = {};
    
    
    // cache DOM elements
    function cacheDom() {
        DOM.$tableContainer = $('.table-container');
        
    }
    
    
    // format dates
    function formatDate(date) {

        return new Date(date)     // make date object for day & month abbrev
            .toDateString()       // convert object to a string
            .slice(0, 15)         // remove everything after the YYYY
            .replace(/ 0/g, ' '); // remove leading zeros (ex. '04' => '4')
    }


    // public render method calls category renderers if category has events
    function render(commitEvents, todoEvents, mergeEvents) {

        // clear previous results
        DOM.$tableContainer
            .empty();
        
        if (commitEvents.length > 0) {
            renderCommitEvents(commitEvents);
        }

        if (todoEvents.length > 0) {
            renderTodoEvents(todoEvents);
        }

        if (mergeEvents.length > 0) {
            renderMergeEvents(mergeEvents);
        }
    }
    
    
    // utility that generates repeated list DOM elements
    function genListParts() {
        return {
            $listItem  : $(document.createElement('li')),
            $img       : $(document.createElement('img')),
            $paragraph : $(document.createElement('p')),
            $paraSpan  : $(document.createElement('span')),
            $a         : $(document.createElement('a'))
        };
    }
    
    
    
    /* assemble <a> DOM elements
     *
     * @params  [string]   url    [link url]
     * @params  [string]   text   [link text]
     * @returns [object]          [assembled <a> DOM object]
    */
    function buildAnchor(url, text) {
        
        return $(document.createElement('a'))
            .attr('target', '_blank')
            .attr('href', url)
            .html(`<span class="bolder">${text}</span>`);
    }
    
    
    /* assemble table-col from list DOM elements
     *
     * @params  [number]   num       [number of events in column]
     * @params  [string]   heading   [description of col's events]
     * @params  [object]   list      [the list jquery object]
     * @returns [object]             [assembled column DOM object]
    */
    function buildColumn(num, heading, list) {
        return $(document.createElement('div'))
            .addClass('table-col')
            .append(`<h3>${num} ${heading}</h3>`)
            .append(list);        
    }
    
    
    /* function to flatten list of commit-related events.
     * Push Events include arrays of commits, which need
     * to be pulled out separately if we're to append each
     * commit to the list
     *
     * @params    [array]   es   [all events]
     * @returns   [array]        [flattened array]
    */
    function flattenCommits(es) {
        
        var flattened = [];
        
        es.forEach(function (e) {
            
            if (e.type === 'PushEvent') {
                // it's a Push Event, extract & push separate commits
                e.payload.commits.forEach(function (commit) {
                    flattened.push({
                        actor   : e.actor,
                        avatar  : e.avatar,
                        date    : e.date,
                        message : commit.message,
                        sha     : commit.sha,
                        type    : 'commit',
                        url     : commit.url
                    });
                });
                
            } else {
                // it's a comment - push straight to 'allEvents'
                flattened.push(e);
            }
            
        });
        
        return flattened;
    }
    
    
    // render commit events
    function renderCommitEvents(es) {

        // receives PushEvent & CommitCommentEvent event types

        var allEvents = flattenCommits(es),
            heading = 'Commit-Related Events',
            $list   = $(document.createElement('ul'));
        
        allEvents.forEach(function (evt) {
            
            // console.log(evt);
            
            var list = genListParts(),
                anchorUrl,
                anchorText;

            if (evt.type === 'commit') {

                // convert api URl to html URL
                anchorUrl = (evt.url)
                    .replace(/\/\/api./, '\/\/')    // remove 'api.'
                    .replace(/\/repos\//, '\/')     // remove 'repos/'
                    .replace(/commits/, 'commit');  // singular 'commit'

                anchorText = (evt.sha).slice(0,6);

                list.$img
                    .attr('src', evt.avatar)
                    .appendTo(list.$listItem);

                list.$paraSpan
                    .text(`"${evt.message}"`);

                list.$paragraph
                    .append(`<span class="bolder">${evt.actor}</span> committed `);

            } else { // else it's a comment
                
                anchorUrl = evt.payload.comment.html_url;
                
                anchorText = (evt.payload.comment.commit_id).slice(0,6);

                list.$img
                    .attr('src', evt.avatar)
                    .appendTo(list.$listItem);

                list.$paraSpan
                    .text(`"${evt.payload.comment.body}"`);

                list.$paragraph
                    .append(`<span class="bolder">${evt.actor}</span> commented on `);

            }
            
            list.$paragraph
                .append(buildAnchor(anchorUrl, anchorText))
                .append(` on ${formatDate(evt.date)}: `)
                .append(list.$paraSpan)
                .appendTo(list.$listItem);
            
            list.$listItem
                .appendTo($list);

        });

        $list
            .addClass('col-list');

        DOM.$tableContainer
            .append(buildColumn(allEvents.length, heading, $list));
        
    }


    // render todo events
    function renderTodoEvents(es) {

        // gets IssuesEvents, IssueCommentEvents, ProjectEvents,
        //   ProjectCardEvents, and ProjectColumnEvents

        var heading = 'Todo-Related Events',
            $list   = $(document.createElement('ul'));

        es.forEach(function (evt) {

            // console.log(evt);

            var list = genListParts(),
                anchorUrl,
                anchorText;
            
            list.$img
                .attr('src', evt.avatar)
                .appendTo(list.$listItem);

            if (evt.type === 'IssuesEvent') {
                
                anchorUrl  = evt.payload.issue.html_url;
                anchorText = `Issue ${evt.payload.issue.number}`;

                list.$paragraph
                    .append(`<span class="bolder">${evt.actor}</span> ${evt.payload.action} `)
                    .append(buildAnchor(anchorUrl, anchorText))
                    .append(` on ${formatDate(evt.date)}: "${evt.payload.issue.title}"`);

            } else if (evt.type === 'IssueCommentEvent') {
                
                anchorUrl  = evt.payload.comment.html_url;
                anchorText = `Issue ${evt.payload.issue.number}`;

                list.$paragraph
                    .append(`<span class="bolder">${evt.actor}</span> commented on `)
                    .append(buildAnchor(anchorUrl, anchorText))
                    .append(` on ${formatDate(evt.date)}: "${evt.payload.comment.body}"`);

            }
            
            list.$listItem
                .append(list.$paragraph)
                .appendTo($list);
        });

        $list
            .addClass('col-list');

        DOM.$tableContainer
            .append(buildColumn(es.length, heading, $list));

    }


    // render merge events
    function renderMergeEvents(es) {

        // receives CreateEvent, PullRequestEvent, PullRequestReviewEvent
        //   and PullRequestReviewCommentEvent event types

        var heading = 'Merge-Related Events',
            $list   = $(document.createElement('ul'));

        es.forEach(function (evt) {

            // console.log(evt);

            var list = genListParts(),
                anchorUrl,
                anchorText;

            list.$img.attr('src', evt.avatar);

            if (evt.type === 'CreateEvent') {

                list.$paragraph
                    .append([
                        `<span class="bolder">${evt.actor}</span> created`,
                        evt.payload.ref_type,
                        `<span class="bolder">${evt.payload.ref}</span> on`,
                        formatDate(evt.date)
                    ].join(' '));

            } else if (evt.type === 'PullRequestEvent') {

                // convert api URl to html URL
                anchorUrl = (evt.payload.pull_request.url)
                    .replace(/\/\/api./, '\/\/')  // remove 'api.'
                    .replace(/\/repos\//, '\/')   // remove 'repos/'
                    .replace(/pulls/, 'pull');    // singular 'pull'

                anchorText = `Pull Request ${evt.payload.pull_request.number}`;

                list.$paragraph
                    .append(`<span class="bolder">${evt.actor}</span>`)
                    .append(` ${evt.payload.action} `)
                    .append(buildAnchor(anchorUrl, anchorText))
                    .append(` on ${formatDate(evt.date)}`);

            } else if (evt.type === 'PullRequestReviewEvent') {
                
                anchorUrl  = evt.payload.pull_request.html_url;
                anchorText = evt.payload.pull_request.title;

                list.$paragraph
                    .append([
                        evt.actor,
                        evt.payload.action,
                        'review of '
                    ].join(' '))
                    .append(buildAnchor(anchorUrl, anchorText))
                    .append(' on' + formatDate(evt.date));

            } else if (evt.type === 'PullRequestReviewCommentEvent') {
                
                anchorUrl  = evt.payload.comment.html_url;
                anchorText = evt.payload.comment.body;

                list.$paragraph
                    .append([
                        `<span class="bolder">${evt.actor}</span>`,
                        evt.payload.action,
                        'pull request comment '
                    ].join(' '))
                    .append(buildAnchor(anchorUrl, anchorText))
                    .append(' on' + formatDate(evt.date));

            }
            
            list.$listItem
                .append(list.$img)
                .append(list.$paragraph)
                .appendTo($list);

        });

        $list
            .addClass('col-list');

        DOM.$tableContainer
            .append(buildColumn(es.length, heading, $list));
        
    }
    
    
    // public init method
    function init() {
        cacheDom();
    }


    // return public methods
    return {
        init: init,
        render: render
    };

}(jQuery));
