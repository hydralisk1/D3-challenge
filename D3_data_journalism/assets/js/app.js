// @TODO: YOUR CODE HERE!

// Set axes margin
const minAdj = 0.9;
const maxAdj = 1.1;

// Set radius of circles
const radius = 10;

// Set svg width and height
const svgWidth = 960;
const svgHeight = 500;

// Set chart margins
const margin = {
    top: 20,
    right: 40,
    bottom: 120,
    left: 120
};

// Get chart's width and height
const width = svgWidth - (margin.left + margin.right);
const height = svgHeight - (margin.top + margin.bottom);


// function running initially
function init(){
    // Read data from the csv file
    d3.csv("assets/data/data.csv").then((data, err) => {
        if (err) throw err;

        // Set svg area
        var svg = d3.select("#scatter")
                    // Set the div as a svg container for responsive design
                    .classed("svg-container", true)
                    .append("svg")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
                    // CSS for responsive design
                    .classed("svg-content-responsive", true);

        // Set chart area
        var chartGroup = svg.append("g")
                            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Change data types to be able to calculate
        data.forEach(d => {
            d.poverty = +d.poverty;
            d.age = +d.age;
            d.income = +d.income,
            d.healthcare = +d.healthcare,
            d.obesity = +d.obesity,
            d.smokes = +d.smokes
        });
        
        // Set default X Axis and Y Axis
        var chosenXAxis = "poverty";
        var chosenYAxis = "healthcare";
    
        // Make scaling functions and rendering initial X and Y axes
        var [x_min, x_max] = d3.extent(data, d => d[chosenXAxis]);
        var [y_min, y_max] = d3.extent(data, d => d[chosenYAxis]);

        var xLinearScale = d3.scaleLinear()
                             .domain([x_min * minAdj, x_max * maxAdj])
                             .range([0, width]);

        var yLinearScale = d3.scaleLinear()
                             .domain([y_min * minAdj, y_max * maxAdj])
                             .range([height, 0]);
    
        var xAxis = chartGroup.append("g")
                              .attr("transform", `translate(0, ${height})`)
                              .call(d3.axisBottom(xLinearScale));
        
        var yAxis = chartGroup.append("g")
                              .call(d3.axisLeft(yLinearScale));

        // Make a tooltip function using d3.tip()
        var toolTip = d3.tip()
                        .attr("class", "d3-tip")
                        .offset([-8, 0])
                        .html(d => {
                            var tip = `${d.state}<br>${chosenXAxis} : `;
                            // Set a unit depending on X-axis
                            // poverty: %, age: nothing, income: $
                            switch (chosenXAxis){
                                case "poverty":
                                    tip += `${d[chosenXAxis]}%`;
                                    break;
                                case "age":
                                    tip += d[chosenXAxis];
                                    break;
                                case "income":
                                    tip += `$${d[chosenXAxis]}`;
                            }
                        tip += `<br>${chosenYAxis} : ${d[chosenYAxis]}%`;

                        return tip;
                        });

        d3.select("svg").call(toolTip);

        // Render circles
        var circleGroup = chartGroup.append("g")
                                    .selectAll("circle")
                                    .data(data)
                                    .enter()
                                    .append("circle")
                                    .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                    .attr("cy", d => yLinearScale(d[chosenYAxis]))
                                    .attr("r", radius)
                                    .classed("stateCircle", true);
        // Render state texts
        var textGroup = chartGroup.append("g")
                                  .selectAll("text")
                                  .data(data)
                                  .enter()
                                  .append("text")
                                  .text(d => d.abbr)
                                  .attr("x", d => xLinearScale(d[chosenXAxis]))
                                  .attr("y", d => yLinearScale(d[chosenYAxis])+parseInt(radius/3))                            
                                  .style("font-size", `${radius}px`)
                                  .style("font-weight", "bold")
                                  .classed("stateText", true);
        // Set listeners for showing and hiding tooltips
        circleGroup.on("mouseover", toolTip.show)
                   .on("mouseout", toolTip.hide);
        
        textGroup.on("mouseover", toolTip.show)
                 .on("mouseout", toolTip.hide);

        // Set labels to put on the chart
        var xLabels = {
            income: "Household Income(Median)",
            age: "Age(Median)",
            poverty: "In Poverty(%)"
        };

        var yLabels = {
            obesity: "Obess(%)",
            smokes: "Smokes(%)",
            healthcare: "Lacks Healthcare(%)"
        };

        // Render X-axis labels
        var xLabelGroup = chartGroup.append("g")
                                    .attr("id", "xlabels")
                                    .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`);
                                     
        var xLabels = xLabelGroup.selectAll("text")
                                 .data(Object.entries(xLabels))
                                 .enter()
                                 .append("text")
                                 .text(d => d[1])
                                 .attr("y", (d, i) => -(i+1)*25)
                                 .attr("id", d => d[0])
                                 .classed("aText", true)
                                 .classed("inactive", d => chosenXAxis !== d[0])
                                 .classed("active", d => chosenXAxis === d[0]);
        // Render Y-axis labels                         
        var yLabelGroup = chartGroup.append("g")
                                    .attr("id", "ylabels")
                                    .attr("transform", `translate(${-1*margin.left}, ${height/2}) rotate(270)`);

        var yLabels = yLabelGroup.selectAll("text")
                                 .data(Object.entries(yLabels))
                                 .enter()
                                 .append("text")
                                 .text(d => d[1])
                                 .attr("y", (d, i) => (i+1)*25)
                                 .attr("id", d => d[0])
                                 .classed("aText", true)
                                 .classed("inactive", d => chosenYAxis !== d[0])
                                 .classed("active", d => chosenYAxis === d[0]);
        // Set listeners to change labels
        xLabelGroup.selectAll("text")
                   .on("click", d => {
                        // If a disabled label chosen
                        if(d[0] !== chosenXAxis){
                            // Disable the currently enabled X-axis, and enable the chosen X-axis
                            xLabelGroup.select(`#${chosenXAxis}`)
                                       .classed("inactive", true)
                                       .classed("active", false);
                                
                            xLabelGroup.select(`#${d[0]}`)
                                       .classed("inactive", false)
                                       .classed("active", true);
                                            
                            chosenXAxis = d[0];

                            // Rescaling
                            [x_min, x_max] = d3.extent(data, d => d[chosenXAxis]);
                            
                            xLinearScale = d3.scaleLinear()
                                             .domain([x_min * minAdj, x_max * maxAdj])
                                             .range([0, width]);
                            // Re-render the chart
                            reRenderChart("x", xLinearScale, chosenXAxis, xAxis, circleGroup, textGroup);
                        }
                   });

        yLabelGroup.selectAll("text")
                   .on("click", d => {
                        // If a disabled label chosen
                        if(d[0] !== chosenYAxis){
                            // Disable the currently enabled Y-axis, and enable the chosen Y-axis
                            yLabelGroup.select(`#${chosenYAxis}`)
                                       .classed("inactive", true)
                                       .classed("active", false);
                            
                            yLabelGroup.select(`#${d[0]}`)
                                       .classed("inactive", false)
                                       .classed("active", true);
                                        
                            chosenYAxis = d[0];
                            // Rescaling
                            [y_min, y_max] = d3.extent(data, d => d[chosenYAxis]);

                            yLinearScale = d3.scaleLinear()
                                             .domain([y_min * minAdj, y_max * maxAdj])
                                             .range([height, 0]);
                            // Re-render the chart
                            reRenderChart("y", yLinearScale, chosenYAxis, yAxis, circleGroup, textGroup);
                        }
                   });            
    }).catch(error => console.log(error));
}

// Function for re-rendering
function reRenderChart(axis, scale, chosenData, axisRerender, circleGroup, textGroup){
    var renderAxis = axis === "x" ? d3.axisBottom(scale) : d3.axisLeft(scale);
    // Adjusting Y coordinate for state texts
    var adjYCoord = axis === "x" ? 0 : parseInt(radius/3);
    
    // Re-rendering axis, circles, and state texts
    axisRerender.transition()
                .duration(1000)
                .call(renderAxis);

    circleGroup.transition()
               .duration(1000)
               .attr(`c${axis}`, d => scale(d[chosenData]));

    textGroup.transition()
             .duration(1000)
             .attr(axis, d => scale(d[chosenData]) + adjYCoord);
}

init();