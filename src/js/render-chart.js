/* Note: the chart is ONLY rendered when events occur on more than 1 day
 * If they all occur on the same day, the chart would just be 1 point! */

/* jshint esversion:6 */
/* globals $, console, document */

var RenderChart = (function () {

    var 
        // placeholder object for cached DOM elements
        DOM = {},
        
        // XML namespace for SVG elements
        ns  = 'http://www.w3.org/2000/svg',
        
        // chart layout attributes
        width   = 1000,
        height  = 400,
        xMargin = 80,
        yMargin = 40,
        spacer  = 40;
        

    // Cache DOM elements
    function cacheDom() {
        DOM.$container = $('.chart-container');
        DOM.$svgElem   = $(document.createElementNS(ns, 'svg'));
    }
    
    
    /* Format dates
     *
     * @params   [string]   date   [string formatted date]
     * @returns  [string]          [formatted date string]
    */
    function formatDates(date) {
        return new Date(date)     // make date object for day & month abbrev
            .toDateString()       // convert object to a string
            .slice(0, 15)         // remove everything after the YYYY
            .replace(/ 0/g, ' '); // remove leading zeros (ex. '04' => '4')
    }


    // Teach Date a new method
    Date.prototype.addDays = function(days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    };
    

    /* Build date range
     *
     * @params   [array]   events   [sorted array of events]
     * @returns  [array]            [range of dates from earliest > recent]
    */
    function buildDateRange(events) {
        
        var normDates   = events.map( (e) => (formatDates(e.date)) ),
            startDate   = new Date(normDates[0]),
            stopDate    = new Date(normDates[normDates.length - 1]),
            dateArray   = [],
            currentDate = startDate;
        
        // console.log(normDates);
        
        while (currentDate <= stopDate) {
            dateArray.push( formatDates(currentDate) );
            currentDate = currentDate.addDays(1);
        }

        // fancy stats
        console.log('========= DATE SPECS =========');
        console.log('Days in range: ' + dateArray.length);
        console.log('   Start date: ' + startDate);
        console.log('    Stop date: ' + stopDate);
        
        return dateArray;
    }
        
    
    /* Calculate max chart Y axis value
     * Max Y is multiple of 5 to make the chart look nice
     *
     * @params   [array]   points   [sorted events array]
     * @returns  [number]           [calculated max Y axis value]
    */
    function getChartYMax(points) {
        var maxNumEvts,
            quotient;

        maxNumEvts = points.reduce(function (a, b) {
            return Math.max(a, b[1]);
        }, points[0][1]);

        quotient = Math.floor(maxNumEvts / 4);

        // console.log('Max daily events: ' + maxNumEvts);
        // console.log('.. so Y axis max: ' + ((quotient + 1) * 4));

        // return 1 more than the quotient, * 5
        return ((quotient + 1) * 4);
    }
    
    
    /* Reformat events array for charting.
     * All events are already unique except push events, because they contain
     * arrays of commits. We make each commit a separate element.  Then
     * get num of events for each date ( sortedArr.filter().length() ).
     *
     * @params   [array]   es   [raw events array]
     * @returns  [array]        [array of date & number of events]
    */
    function prepareDateEvents(es) {

        var events = [],
            sortedEvents,
            dateArray,
            chartData = [];
        
        es.forEach(function (evt) {

            //  console.log(evt);  // diag

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
        // console.log(sortedEvents); // ok
        
        // get array of all dates in range
        dateArray = buildDateRange(sortedEvents);
        // console.log(dateArray);
        
        // build array of data points: [date, #events per date]
        chartData = dateArray.map(function (date) {
            return [
                
                // the date, as Month and Day
                date.slice(3, 10),
                
                // number of events per date
                sortedEvents.filter( (x) => formatDates(x.date) === date ).length
            ];            
        });
        
        // console.log(chartData);  // diag
    
        return chartData;
    }
    
    
    /* check if all events occur on the same day
     *
     * @params   [array]   pointsArr   [events coordinate data points]
     * @reutrns  [boolean]             [ret true if all events on 1 day]
    */
    function sameDamnDay(pointsArr) {
        return pointsArr.length === 1;
    }
    
    
    /* generate chart points
     *
     * @params  [array]    points  [array of coordinate points]
     * @returns [object]           [<g>roup of <circle> elements]
    */
    function generateCircles(points) {

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
            title.text(points[ind][0] + ' (' + points[ind][1] + ' events)');
            
            // append title to circle
            circle.append(title);
            
            // append circle to group
            group
                .addClass('chart-circle')
                .append(circle); 

        });
    
    return group;
    
    }
    
    
    /* generate chart line
     *
     * @params  [array]    points  [array of coordinate points]
     * @returns [object]           [<g>roup of <line> segments]
    */
    function generateLines(points) {
        
        // init vars
        var group = $(document.createElementNS(ns, 'g')),
            currentPoint,
            i,
            line,
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
        
        // loop through points array appending lines to group
        for (i = 0; i < formattedPoints.length - 1; i += 1) {
            
            line = $(document.createElementNS(ns, 'line'));
            
            // describe <line>
            line
                .attr('x1', formattedPoints[i][0])
                .attr('y1', formattedPoints[i][1])
                .attr('x2', formattedPoints[i + 1][0])
                .attr('y2', formattedPoints[i + 1][1]);
                
            // append <line> to <g>roup
            group
                .addClass('chart-line')
                .append(line);
        }
    
    return group;
    
    }
    
    
    /* generate axis labels
     *
     * @params  [array]    points  [array of coordinate points]
     * @params  [string]   axis    ['y' or 'x' specifies conditional path]
     * @returns [object]           [<g>roup of axis <line> and <text> els]
    */
    function genAxisLabels(points, axis) {
        
        var group = $(document.createElementNS(ns, 'g')),
            line, // placeholder for <line> element built in loop
            text, // placeholder for <text> element built in loop
            numAxisTicks,
            xPos, xValue, xMultiple,
            yPos, yValue, ySpacing,
            maxYval,
            chartYMax = getChartYMax(points),
            i;
        
        maxYval = points.reduce(function (a, b) {
            return Math.max(a, b[1]);
        }, points[0][1]);
        
        // conditionally handle passed axis param
        if (axis === 'y') {
            // add CSS class to <g> element
            group.addClass('labels y-labels');
            
            // limit qty of Y axis labels based on chartYMax
            numAxisTicks = (chartYMax > 12) ? chartYMax / 4 : chartYMax;
            
            // calculate relative space between each Y axis label
            ySpacing = (height - yMargin - spacer) / numAxisTicks;
            
            // loop through numAxisTicks, generate <line> and <text> elements,
            // then append each of them to our <g>roup
            for (i = 0; i < numAxisTicks + 1; i += 1) {
                
                // calculate y axis label value
                yValue = i * chartYMax / numAxisTicks;
                
                // calculate y axis label position
                yPos = height - yMargin - (ySpacing * i);
                
                // create new <line> element
                line = $(document.createElementNS(ns, 'line'));
                
                // add attributes to <line> element
                line.addClass('horiz-rule')
                    .attr('x1', xMargin)
                    .attr('y1', yPos)
                    .attr('x2', (width - spacer + 5))
                    .attr('y2', yPos);
                
                // create new <text> element
                text = $(document.createElementNS(ns, 'text'));
                
                // add attributes to <text> element
                text
                    .attr('x', (xMargin - 20))
                    .attr('y', (yPos + 4))
                    .html(yValue);
                
                group
                    .append(line)
                    .append(text);
            }
            return group;
        
        } else if (axis === 'x' || !axis || axis === null) {
            
            // add CSS class to the <g>roup
            group.addClass('labels x-labels');
            
            numAxisTicks = points.length - 1;
            xMultiple = (width - xMargin - spacer) / numAxisTicks;
            
            // loop through points, generate <line> and <text> elements,
            // and append each of them to our <g> group
            for (i = 0; i < points.length; i += 1) {
                
                // for large datasets, only append every 10th date
                if (points.length > 20) {
                    
                    if (i % 10 === 0) {
                        // calculate y axis label values
                        xValue = points[i][0];

                        // calculate y position
                        xPos = i * xMultiple;

                        // create new <text> element
                        text = $(document.createElementNS(ns, 'text'));

                        // add attributes to <text> element
                        text
                            .attr('x', (xPos + xMargin))
                            .attr('y', (height - 5))
                            .text(xValue);

                        group
                            .append(text);
                    }
                    
                } else {                

                    // calculate y axis label values
                    xValue = points[i][0];

                    // calculate y position
                    xPos = i * xMultiple;

                    // create new <text> element
                    text = $(document.createElementNS(ns, 'text'));

                    // add attributes to <text> element
                    text
                        .attr('x', (xPos + xMargin))
                        .attr('y', (height - 5))
                        .text(xValue);

                    group
                        .append(text);
                }
            }
            return group;
        }
        
    }

    
    // MAIN RENDERER
    // Receives ALL events from 'get-events.js'
    function render(events) {
        
        var points;
        
        // add CSS class, namespace and attributes to main <svg> element
        DOM.$svgElem
            .addClass('chart--content')
            .attr('id', 'svg')
            .attr('xmlns', ns)
            // .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr('xml:space', 'preserve');
        
        if (events.length > 0) {
            
            // empty parent SVG element before each render
            DOM.$svgElem.empty();
                        
            // format events to usable points
            points = prepareDateEvents(events);
            
            // check if ALL events occur on the same day!
            if (sameDamnDay(points)) {
                return;
            }
            
            // append axis label <text> <g>roups
            DOM.$svgElem
                .append(genAxisLabels(points, 'y'))
                .append(genAxisLabels(points, 'x'));
            
            // append line
            DOM.$svgElem
                .append(generateLines(points));

            // append points/circles <g>roup
            DOM.$svgElem
                .append(generateCircles(points));

            // append SVG to container
            DOM.$container
                .append(DOM.$svgElem);
            
        }        
    }
    
    
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