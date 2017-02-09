/* jshint esversion:6 */
/* globals $, document, console, LS */

// Goal: "You are currently viewing {RepoName} \/ repository."

var RepoSelect = (function() {
    
    var DOM = {};
    
    
    // cache DOM elements
    function cacheDom() {
        DOM.$selectContainer = $('#repo-select');
        DOM.$selector = $(document.createElement('span'));
        DOM.$listContainer = $(document.createElement('div'));
        DOM.$repoList = $(document.createElement('ul'));
    }
    
    
    // bind events
    function bindEvents() {
        DOM.$selector.on('click', showRepoList);
    }
    
    
    // build repo list from local storage
    function buildRepoList() {
        
//        var repos = [];
        
        var repos = [
            'dev-dash',
            'meerkat_momentum'
        ];
        
        if (LS.getData('dev-dash') && LS.getData('dev-dash').repos) {
            LS.getData('dev-dash').repos.forEach(function (repo) {
               repos.push(repo);
            });
        }
        
        if (repos.length === 0) {
            DOM.$repoList
                .append(`<li>Add some repos, yo!</li>`);
        } else {
            repos.forEach(function (repo) {
                
                var $anchor = $(document.createElement('a')),
                    $li = $(document.createElement('li'));
                
                $anchor
                    .attr('href', '#')
                    .html(repo);
                
                $li
                    .append($anchor);
                
                DOM.$repoList
                    .append($li);
            });
        }
        
        DOM.$listContainer
            .append(DOM.$repoList);
        
    }
    
    
    // show/hide repo list
    function showRepoList(e) {
        
        e.preventDefault();
        
        DOM.$selectContainer
            .append(DOM.$listContainer);
        
        DOM.$listContainer
            .toggleClass('hidden');

    }
    
    
    // render
    function render() {
        
        DOM.$listContainer
            .addClass('repo-list')
            .addClass('hidden');
        
        DOM.$selector
            .addClass('repo-select')
            .html('dev-dash &#x25BC;');
        
        DOM.$selectContainer
            .append('You are currently viewing ')
            .append(DOM.$selector)
            .append(' repository.');
    }
    
    
    // public init method
    function init() {
        cacheDom();
        buildRepoList();
        bindEvents();
        render();
    }
    
    
    // export public methods
    return {
        init: init
    };
    
}());
