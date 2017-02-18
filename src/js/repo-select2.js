/* jshint esversion:6 */
/* globals jQuery, document, console, LS */

// Goal: "You are currently viewing {RepoName} \/ repository."

var RepoSelect = (function ($) {

    var DOM = {},
        repos = [];


    // cache DOM elements
    function cacheDom() {
        DOM.$selectContainer = $('.repo-select');
        DOM.$selector      = $(document.createElement('span'));
        DOM.$listContainer = $(document.createElement('div'));
        DOM.$ul            = $(document.createElement('ul'));
        DOM.$newRepoForm   = $(document.createElement('form'));
        DOM.$newRepoUser   = $(document.createElement('input'));
        DOM.$newRepoRepo   = $(document.createElement('input'));
        DOM.$newRepoBtn    = $(document.createElement('button'));
    }


    // bind events
    function bindEvents() {
        DOM.$selector.on('click', showRepoList);
        // add new repo
        // remove repo
    }
    
    
    // show/hide repo list
    function showRepoList(e) {
        
        e.preventDefault();
        
        DOM.$listContainer
            .toggleClass('hidden');

    }
    
    
    // populate repos array
    function populateRepos(data) {
        repos = data.map( (repo) => repo );
        return data;
    }


    // populate repo list menu
    function populateMenu(data) {
        // console.log(data);

        data.forEach(function (repo, ind) {
            var $li = $(document.createElement('li')),
                repoObj = {
                    user: repo.owner.login,
                    name: repo.name,
                    description: repo.description,
                    updated: repo.updated_at
                };

            // console.log(repoObj);

            $li
                .html(`<div class="li-descriptions" data-repo="${repoObj.name}">
                         <p>${repoObj.user} / ${repoObj.name}</p>
                         <p>${repo.description}</p>
                       </div>
                       <span class="li-remove">&#10060</span>`);

            DOM.$ul
                .append($li);
        });
        
        render();
    }
    
    
    // render
    function render() {
        
        DOM.$newRepoBtn
            .html('+');

        DOM.$newRepoUser
            .attr('required', 'true')
            .attr('placeholder', 'author');

        DOM.$newRepoRepo
            .attr('required', 'true')
            .attr('placeholder', 'repo');

        DOM.$newRepoForm
            .addClass('new-repo-form')
            .append(DOM.$newRepoUser)
            .append(DOM.$newRepoRepo)
            .append(DOM.$newRepoBtn);

        DOM.$listContainer
            .addClass('repo-list')
            .addClass('hidden')
            .empty()
            .append(DOM.$ul)
            .append(DOM.$newRepoForm);
        
        DOM.$selector
            .addClass('repo-select-highlight')
            .html(`${repos[0].name}&#x25BC;`);
        
        DOM.$selectContainer
            .append('You are currently viewing ')
            .append(DOM.$selector)
            .append(' repository.')
            .append(DOM.$listContainer);
    }


    function getRepos(userName) {

        $.getJSON('https://api.github.com/users/' + userName + '/repos?sort=updated')
            .then((repos) => repos.slice(0, 3)) // 3 most recently updated repos
            .then(populateRepos)
            .then(populateMenu);
    }

    
    // public init method
    function init() {
        cacheDom();
        bindEvents();
    }
    
    
    // export public api
    return {
        init: init,
        getRepos: getRepos
    };
    

}(jQuery));