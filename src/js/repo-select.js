/* jshint esversion:6 */
/* globals jQuery, document, console, LS, HitApi */

var RepoSelect = (function ($) {

    var DOM   = {},
        repos = [],
        selectedRepo;
    
    
    // util checks local storage for previously saved list of repos
    var checkStorage = (function() {
        return LS.getData('dev-dash-repos') ? true : false;
    }());


    // cache DOM elements
    function cacheDom() {
        DOM.$selectContainer = $('.repo-select');
        DOM.$p               = $(document.createElement('p'));
        DOM.$listContainer   = $(document.createElement('div'));
        DOM.$ul              = $(document.createElement('ul'));
        DOM.$newRepoForm     = $(document.createElement('form'));
        DOM.$newRepoUser     = $(document.createElement('input'));
        DOM.$newRepoRepo     = $(document.createElement('input'));
        DOM.$newRepoBtn      = $(document.createElement('button'));
    }


    // bind events
    function bindEvents() {
        DOM.$selectContainer.on('click', '.repo-select-highlight', showRepoList);
        DOM.$ul.on('click', 'div.li-descriptions', selectRepo);
        DOM.$ul.on('click', 'span.li-remove', deleteRepo);
        DOM.$newRepoForm.on('submit', addRepo);
    }
    
    
    // show/hide repo list
    function showRepoList(e) {
        e.stopPropagation();

        DOM.$listContainer
            .toggleClass('hidden');
    }
    
    
    // select a repo to view
    function selectRepo(e) {
        e.stopPropagation();
        
        var picked = e.currentTarget.children[0].innerHTML.split(' / ');
        
        selectedRepo = picked[1];
        
        // console.log(picked); // diag
        populateMenu(repos);
            
        // Call HitApi module's public .getEvents() method
        HitApi.getEvents(picked[0], picked[1]);
        
        // retract repo list
        DOM.$listContainer
            .addClass('hidden');
    }
    
    
    // delete repo from the list
    function deleteRepo(e) {
        e.stopPropagation();
        
        var authorAndRepo   = e.target.previousElementSibling.dataset.repo,
            selectedElement = $(e.target).parent(),
            selectedElemId  = selectedElement.attr('id');
        
        // console.log('Delete: ' + authorAndRepo); // diag
        
        repos.splice(selectedElemId, 1);
        selectedElement.remove();
        LS.setData('dev-dash-repos', repos);
    }
    
    
    // add repo to the list
    function addRepo(e) {
        
        e.preventDefault();
        e.stopPropagation();
        
        var apiUrl    = 'https://api.github.com/repos',
            newAuthor = e.currentTarget[0].value,
            newRepo   = e.currentTarget[1].value;
        
        $.getJSON(`${apiUrl}/${newAuthor}/${newRepo}`)
            .then(function (repo) {
                repos.unshift(repo);
            
                // clear inputs
                DOM.$newRepoUser[0].value = '';
                DOM.$newRepoRepo[0].value = '';
            
                return repos;
            })
            .then(saveRepos)
            .then(populateMenu)
            .catch(function (err) {
                console.warn('Error fetching repo.');
            });
    
        
    }
    
    
    // populate module scope repos array & call HitApi on 1st load
    function populateRepos(data) {
        
        if (data && data.length) {

        
            data.forEach(function (repo) {
                repos.push(repo);
            });

            // capture 1st repo's author & repo name in an array
            var repoZero = repos[0].full_name.split('/');

            // set selected repo to first repo's name
            selectedRepo = repoZero[1];

            // Call HitApi module's public .getEvents() method
            HitApi.getEvents(repoZero[0], repoZero[1]);

            return data;
        }
    }
    
    
    // save repos to local storage
    function saveRepos(data) {
        LS.setData('dev-dash-repos', repos);
        return data;
    }
    
    
    // populate repo list menu
    function populateMenu(data) {
        
        // console.log(data);
        
        if (data && data.length) {
            
            DOM.$ul.html('');

            data.forEach(function (repo, ind) {
                var $li = $(document.createElement('li'));

                $li
                    .attr('id', ind)
                    .html(`<div class="li-descriptions" data-repo="${repo.name}">
                             <p>${repo.owner.login} / ${repo.name}</p>
                             <p>${repo.description}</p>
                           </div>
                           <span class="li-remove">&#10060</span>`);

                DOM.$ul
                    .append($li);
            });

            render();
        
        } else {
            console.log('no repos, holmes');
            render();
            DOM.$listContainer
                .removeClass('hidden');
        }
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
            
            .append(DOM.$ul)
            .append(DOM.$newRepoForm);
        
        DOM.$p
            .html(`You are currently viewing the <span class="repo-select-highlight">${selectedRepo}&#x25BC;</span> repository.`);
                
        DOM.$selectContainer
            .append(DOM.$p)
            .append(DOM.$listContainer);

    }


    // public method to kick of the whole module
    function getRepos(userName) {
        
        if (checkStorage) {
            // console.log('Using local storage'); // diag
            populateRepos(LS.getData('dev-dash-repos')); // cache 'repos' to module scope var
            populateMenu(repos);  // build the list
            
        } else {
            
            // get user's most recently-active repos from GitHub
            $.getJSON('https://api.github.com/users/' +
                      userName +
                      '/repos?sort=updated')
                .then( (repos) => repos.slice(0, 3) ) // most-recent 3 repos
                .then(populateRepos)  // cache repos to module scope 'repos'array
                .then(saveRepos)      // save them in local storage
                .then(populateMenu);  // build the list
        }
    }

    
    // public init method
    function init() {
        cacheDom();
        bindEvents();
        DOM.$listContainer.addClass('hidden');
    }
    
    
    // export public methods
    return {
        init: init,
        getRepos: getRepos
    };

}(jQuery));
