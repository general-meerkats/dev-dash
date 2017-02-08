##Dev Dash

###By The General Meerkats

Demo: https://general-meerkats.github.io/dev-dash/

####How to contribute:

Clone or fork the repo, create a new branch for your edits/additions, and push your _branch_.  This way we can review/test the changes in your pull request before merging with the master branch.

**Commit often, push once!**  Avoid bundling a whole bunch of unrelated changes in a single commit, because it's harder to review code in a pull request when there are a million changes in one commit.  You can push multiple commits at the same time, so split unique changes into unique commits.  Change/fix one thing, commit just that change.  Change some other thing, commit _that_ change.  When you finally push to Github, the push event will contain all those separate commits.

####Some git notes:

Creating a new local repo & linking it to a repote repo (ssh):

1.  `git init`
2.  `git remote add origin git@github.com:general-meerkats/dev-dash.git`

Cloning the repo (ssh):

1.  `git init`
2.  `git clone git@github.com:general-meerkats/dev-dash.git`

Branching shortcut using 'checkout':

1.  `git checkout -b {your branch name}`

    This both creates the new branch and switches to it in 1 step.

Push to a branch:

1.  `git push {remote} {branch}`
    
    For example: `git push origin crazyhack`  Now, the branch will be available on Github and you can open a pull request with it.
