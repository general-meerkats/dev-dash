/* jshint esversion:6 */
/* globals $, console, document */

var RenderChart = (function () {

    var DOM = {},
        
        // XML namespace for SVG elements
        ns  = 'http://www.w3.org/2000/svg',
        
        // define chart layout attributes
        width   = 1000,
        height  = 400,
        xMargin = 10,
        yMargin = 10,
        spacer  = 10;
        

    // Cache DOM elements
    function cacheDom() {
        DOM.$container = $('.chart-container');
        DOM.$svgElem   = $(document.createElementNS(ns, 'svg'));
    }
    
    
    // Format dates
    function formatDates(date) {
        return new Date(date)     // make date object for day & month abbrev
            .toDateString()       // convert object to a string
            .slice(0, 15)         // remove everything after the YYYY
            .replace(/ 0/g, ' '); // remove leading zeros (ex. '04' => '4')
    }


    // Add Date prototype method
    Date.prototype.addDays = function(days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    };
    

    // Build date range
    function buildDateRange(repos) {
        
        var startDate   = new Date(repos[0].date),
            stopDate    = new Date(repos[repos.length - 1].date),
            dateArray   = [],
            currentDate = startDate;
        
        while (currentDate <= stopDate) {
            dateArray.push( formatDates(currentDate) );
            currentDate = currentDate.addDays(1);
        }

        // fancy
        console.log('========= DATE SPECS =========');
        console.log('Days in range: ' + dateArray.length);
        console.log('   Start date: ' + formatDates(startDate));
        console.log('    Stop date: ' + formatDates(stopDate));
        
        return dateArray;
    }
    
    
    // Calculate max chart Y axis value
    // Max Y is multiple of 5 to make the chart look nice
    function getChartYMax(points) {
        var maxNumEvts,
            quotient;

        maxNumEvts = points.reduce(function (a, b) {
            return Math.max(a, b[1]);
        }, points[0][1]);

        quotient = Math.floor(maxNumEvts / 5);

        console.log('Max daily events: ' + maxNumEvts);
        console.log('.. so Y axis max: ' + ((quotient + 1) * 5));

        // return 1 more than the quotient, times 5
        return ((quotient + 1) * 5);
    }
    
    
    // Main render method calls prepareDate if events.
    // Receives ALL events from 'get-events.js'
    function render(events) {
        
        // clear previous results
        DOM.$container.empty();

        if (events.length > 0) {
            prepareData(events);
        }
    }
    
    
    // Reformat events array for charting
    // Basically, all events are already unique except push events,
    // because they contain an array of commits. So we extract those
    // commits as separate array elements.
    function prepareData(es) {

        var events = [],
            sortedEvents,
            dateArray,
            chartData = [];

        es.forEach(function (evt) {

            // console.log(evt);

            if (evt.type === 'PushEvent') {

                // when it's a push event, extract the commits
                evt.payload.commits.forEach(function (commit) {
                    
                    events.push({
                        actor: evt.actor,
                        avatar: evt.avatar,
                        date: evt.date,
                        payload: commit,
                        type: "Commit"
                    });

                });
            } else {
                events.push(evt);
            }
        });
        
        // sort events ascending
        sortedEvents = events.sort( (a, b) => new Date(a.date) - new Date(b.date) );
        // console.log(sortedEvents);
        
        // get array of all dates in range
        dateArray = buildDateRange(sortedEvents);
        
        // build array of data points: [date, #events per date]
        chartData = dateArray.map(function (date) {
            return [
                
                // the date
                date,
                
                // number of events per date
                sortedEvents.filter( (x) => x.date === date ).length
            ];            
        });
        
        // console.log(chartData);  // FUCK YES
        
        // send data to chart builder
        buildChart(chartData);
        
    }
    
    
    // build the damn chart
    function buildChart(points) {
        
        // getChartYMax(points);
        
        // add CSS class, namespace and attributes to main <svg> element
        DOM.$svgElem.addClass('chart--content')
            .attr('id', 'svg')
            .attr('xmlns', ns)
//            .attr('width', '100%')
//            .attr('height', '100%')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr('xml:space', 'preserve');
        
        // init vars
        var group = $(document.createElementNS(ns, 'g')),
            currentPoint,
            numPoints = points.length - 1,
            chartYMax = getChartYMax(points),
            
            // multipliers scale the output x & y coords
            xMultiple = (width - xMargin - spacer) / numPoints,
            yMultiple = (height - yMargin - spacer) / chartYMax,
            
            // format values to align with chart extents
            formattedPoints = points.map(function(point, ind) {
                return [
                    (ind * xMultiple) + xMargin,
                    (height - (point[1] * yMultiple)) - yMargin
                ];
            });
        
        // loop through points array appending circles to group
        formattedPoints.forEach(function (point, ind) {
            
            var circle = $(document.createElementNS(ns, 'circle')),
                title  = $(document.createElementNS(ns, 'title')),
                
                // <circle> wants attrs: cx, cy, r
                cx = point[0],
                cy = point[1],
                r  = 4;
            
            circle
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', r);
            
            // <title> adds 'tool tip' on hover
            title.text(points[ind][0] + ' - ' + points[ind][1] + ' events');
            
            // append title to circle
            circle.append(title);
            
            // append circle to group
            group.append(circle);
            
            
        });
                
        DOM.$svgElem
            .empty()
            .append(group);
        
        DOM.$container.append(DOM.$svgElem);
        
    }  /* end buildChart */


    // public init method
    function init() {
        cacheDom();
    }


    // return public api
    return {
        init: init,
        render: render
    };


}());