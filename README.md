##Dev Dash

###By The General Meerkats

Demo: https://general-meerkats.github.io/dev-dash/

**dev-dash** is a Chrome browser new-tab override that presents a brief dashboard view of a selected GitHub repository.  It installs as a Chrome browser extension and once installed, displays **dev-dash** whenever you open a new tab instead of Chrome's traditional new tab page.

https://chrome.google.com/webstore/detail/dev-dash/dgkmjidcaelocfmnhlmeimmbaljgjfhm

There's no back-end.  It persists input data to your browser's local storage.  There's currently no way to clear that local storage from within the app, so make sure you spell you name right on 1st load! :smiley:  You can clear the app's data from local storage manually with this console command: `LS.clearData()`

**What's the point of this?** It's designed to make checking repository activity more efficient.  You may be participating in the Chingu cohorts with a project team on a tight schedule, frequently pushing _a lot_ of code to GitHub. Pushes, comments, PR's, etc.  Instead of going to GitHub and sifting through histories, **dev-dash** shows you all the relevant recent events in a single view whenever you launch Chrome or open a new tab.  It looks like this:

![alt text](https://discourse-user-assets.s3.amazonaws.com/original/3X/4/4/443ca4e6e9cb2dcefac42996818d1cb35b7789ab.png "Screenshot 1")

**Using it**

Step 1: You'll get a modal prompt on first load - input the name you want the app to call you and your **valid** GitHub username (the app checks :wink: ):

![alt text](https://discourse-user-assets.s3.amazonaws.com/original/3X/f/7/f71599b1dabe0bbc5bcdc1ccf6d7c952dc74aea2.png "Screenshot 2")

Your GitHub username is used to initially add some repos (currently your three most recently updated) to the list of tracked repositories.  You can add more and remove the initial three if you want from the repo list:

![alt text](https://discourse-user-assets.s3.amazonaws.com/original/3X/1/b/1b18e97e2e73589c656c4b659e4ff0a67d127574.png "Screenshot 3")

As previously mentioned, there is no back end.  I collect no data from you (although Google likely tracks extension usage).
