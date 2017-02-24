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


    // render commit events
    function renderCommitEvents(es) {

        // receives PushEvent & CommitCommentEvent event types

        var $listContainer = $(document.createElement('div')),
            $column       = $(document.createElement('div')),
            $list         = $(document.createElement('ul'));

        es.forEach(function (evt) {
            
            // console.log(evt);
            
            var $listItem  = $(document.createElement('li')),
                $img       = $(document.createElement('img')),
                $paragraph = $(document.createElement('p')),
                $paraSpan  = $(document.createElement('span')),
                $a         = $(document.createElement('a'));
            
            $a
                .attr('target', '_blank');

            if (evt.type === 'PushEvent') {

                // when it's a push event, extract the commits
                evt.payload.commits.forEach(function (commit) {

                    // convert commit URL into regular github.com URL
                    // from: https://api.github.com/repos/{user}/{repo}/commits/{sha}
                    //   to: https://github.com/{user}/{repo}/commit/{sha}
                    var cleanUrl = (commit.url)
                        .replace(/\/\/api./, '\/\/')    // remove 'api.'
                        .replace(/\/repos\//, '\/')     // remove 'repos/'
                        .replace(/commits/, 'commit');  // singular 'commit'

                    $img
                        .attr('src', evt.avatar)
                        .appendTo($listItem);

                    $a
                        .attr('href', cleanUrl)
                        .html(`<span class="bolder">${(commit.sha).slice(0,6)}</span>`);

                    $paraSpan
                        .text(`"${commit.message}"`);

                    $paragraph
                        .append(`<span class="bolder">${evt.actor}</span> committed `);

                });

            } else { // else it's a comment

                $img
                    .attr('src', evt.avatar)
                    .appendTo($listItem);

                $a
                    .attr('href', evt.payload.comment.html_url)
                    .html(`<span class="bolder">${(evt.payload.comment.commit_id).slice(0,6)}</span>`);

                $paraSpan
                    .text(`"${evt.payload.comment.body}"`);

                $paragraph
                    .append(`<span class="bolder">${evt.actor}</span> commented on `);

            }
            
            $paragraph
                .append($a)
                .append(` on ${formatDate(evt.date)}: `)
                .append($paraSpan)
                .appendTo($listItem);
            
            $listItem
                .appendTo($list);

        });

        $list
            .addClass('col-list')
            .appendTo($listContainer);
        
        $column
            .addClass('table-col')
            .append(`<h3>${es.length} Commit-Related Events</h3>`)
            .append($listContainer)
            .appendTo(DOM.$tableContainer);
        
    }


    // render todo events
    function renderTodoEvents(es) {

        // gets IssuesEvents, IssueCommentEvents, ProjectEvents,
        //   ProjectCardEvents, and ProjectColumnEvents

        var $column = $(document.createElement('div')),
            $list   = $(document.createElement('ul'));

        es.forEach(function (evt) {

            // console.log(evt);

            var $listItem  = $(document.createElement('li')),
                $img       = $(document.createElement('img')),
                $paragraph = $(document.createElement('p')),
                $a         = $(document.createElement('a'));

            $img
                .attr('src', evt.avatar)
                .appendTo($listItem);

            $a.attr('target', '_blank');

            if (evt.type === 'IssuesEvent') {

                $a
                    .attr('href', evt.payload.issue.html_url)
                    .html(`<span class="bolder">issue ${evt.payload.issue.number}</span>`);

                $paragraph
                    .append(`<span class="bolder">${evt.actor}</span> ${evt.payload.action} `)
                    .append($a)
                    .append(` on ${formatDate(evt.date)}: "${evt.payload.issue.title}"`);

            } else if (evt.type === 'IssueCommentEvent') {

                $a
                    .attr('href', evt.payload.comment.html_url)
                    .html(`<span class="bolder">issue ${evt.payload.issue.number}</span>`);

                $paragraph
                    .append(`<span class="bolder">${evt.actor}</span> commented on `)
                    .append($a)
                    .append(` on ${formatDate(evt.date)}: "${evt.payload.comment.body}"`);

            }
            
            $listItem
                .append($paragraph)
                .appendTo($list);
        });

        $list
            .addClass('col-list');

        $column
            .addClass('table-col')
            .append(`<h3>${es.length} Todo-Related Events</h3>`)
            .append($list)
            .appendTo(DOM.$tableContainer);

    }


    // render merge events
    function renderMergeEvents(es) {

        // receives CreateEvent, PullRequestEvent, PullRequestReviewEvent
        //   and PullRequestReviewCommentEvent event types

        var $column = $(document.createElement('div')),
            $list   = $(document.createElement('ul')),
            cleanUrl;

        es.forEach(function (evt) {

            // console.log(evt);

            var $listItem  = $(document.createElement('li')),
                $img       = $(document.createElement('img')),
                $paragraph = $(document.createElement('p')),
                $a         = $(document.createElement('a'));

            $img.attr('src', evt.avatar);

            $a.attr('target', '_blank');

            if (evt.type === 'CreateEvent') {

                $paragraph
                    .append([
                        `<span class="bolder">${evt.actor}</span>`,
                        'created',
                        evt.payload.ref_type,
                        `<span class="bolder">${evt.payload.ref}</span>`,
                        'on',
                        formatDate(evt.date)
                    ].join(' '));

            } else if (evt.type === 'PullRequestEvent') {

                // from: https://api.github.com/repos/belcurv/meerkat_momentum/pulls/11
                //   to: https://github.com/belcurv/meerkat_momentum/pull/11
                cleanUrl = (evt.payload.pull_request.url)
                    .replace(/\/\/api./, '\/\/')  // remove 'api.'
                    .replace(/\/repos\//, '\/')   // remove 'repos/'
                    .replace(/pulls/, 'pull');    // singular 'pull'

                $a
                    .attr('href', cleanUrl)
                    .html(`<span class="bolder">pull request ${evt.payload.pull_request.number}</span>`);

                $paragraph
                    .append(`<span class="bolder">${evt.actor}</span>`)
                    .append(` ${evt.payload.action} `)
                    .append($a)
                    .append(` on ${formatDate(evt.date)}`);

            } else if (evt.type === 'PullRequestReviewEvent') {

                $a
                    .attr('href', evt.payload.pull_request.html_url)
                    .text(evt.payload.pull_request.title);

                $paragraph
                    .append([
                        evt.actor,
                        evt.payload.action,
                        'review of '
                    ].join(' '))
                    .append($a)
                    .append(' on' + formatDate(evt.date));

            } else if (evt.type === 'PullRequestReviewCommentEvent') {

                $a
                    .attr('href', evt.payload.comment.html_url)
                    .text(evt.payload.comment.body);

                $paragraph
                    .append([
                        `<span class="bolder">${evt.actor}</span>`,
                        evt.payload.action,
                        'pull request comment '
                    ].join(' '))
                    .append($a)
                    .append(' on' + formatDate(evt.date));

            }
            
            $listItem
                .append($img)
                .append($paragraph)
                .appendTo($list);

        });

        $list
            .addClass('col-list');

        $column
            .addClass('table-col')
            .append(`<h3>${es.length} Merge-Related Events</h3>`)
            .append($list)
            .appendTo(DOM.$tableContainer);
        
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
