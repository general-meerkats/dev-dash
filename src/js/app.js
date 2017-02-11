/* jshint esversion:6 */
/* globals $, document, console */

/* app.js call each module's public method(s)  */

$(document).ready(function () {
    
    Backgrounds.init();
    
    RepoSelect.init();
    
    Greet.init();
    
    HitApi.init();
    
    RenderTable.init();

    RenderChart.init();

});