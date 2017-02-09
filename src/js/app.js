/* jshint esversion:6 */
/* globals $, document, console */

/* app.js call each module's public method(s)  */

$(document).ready(function () {
    
    // Backgrounds.init();  // todo
    
    // Greeter.init();  // todo
    
    HitApi.init();
    
    RenderTable.init();

    // RenderGraph.render();  // todo

});