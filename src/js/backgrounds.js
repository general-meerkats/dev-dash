/* jshint esversion:6 */
/* globals $, console, LS */

var Backgrounds = (function() {
    
    'use strict';
    
    var DOM = {},
        bgArr = ['001', '002', '003', '004', '005', '006', '007'],
        today = makeDate(),
        state = loadState();
    
    
    // cache DOM elements
    function cacheDom() {
        DOM.$body = $('body');
    }
    
    
    // make and format date string
    function makeDate() {
        return new Date()
            .toDateString()   // convert object to a string
            .slice(4, 15);    // just want 'MM DD YYYY'
    }
    
    
    // load state from storage
    function loadState() {
        var storedState = LS.getData('dev-dash-bg'),
            newState = {
                imgName: '001',
                date: makeDate()
            };
        
        return (storedState) ? storedState : newState;
    }
    
        
    // set background image
    // new image each new day. So we 1st compare today with
    // local storage date, update local storage if different,
    // and then set the background image CSS on <body>
    function pickBackground() {
                
         console.log(today, state);  // for diag
        
        var curntImgIndx = bgArr.indexOf(state.imgName),
            newImgIndex,
            newImgName;
        
        if (new Date(today) > new Date(state.date)) {
            
            // find new image index
            newImgIndex = (curntImgIndx === 6) ? 1 : curntImgIndx + 1;
            
            // find new image string name
            newImgName = bgArr[newImgIndex];
            
            // save new image name & date to local storage 
            LS.setData('dev-dash-bg', {
                imgName: newImgName,
                date: today
            });
            
            // update the DOM
            render(newImgName);
            
        } else {
            render(state.imgName);
        }
        
    }
    
    
    // render to DOM
    function render(imageName) {
        DOM.$body
            .css('background-image', 'url(dist/assets/' + imageName + '.jpg)');
    }
    
    
    // public init method
    function init() {
        cacheDom();
        pickBackground();
    }
    
    
    // return public api
    return {
        init: init
    };
    
}());