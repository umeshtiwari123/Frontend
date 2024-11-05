// Set dimensions and margins for the chart
const margin = { top: 40, right: 80, bottom: 60, left: 80 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Set up the x and y scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Create the SVG element and append it to the chart container
const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const dropdown = d3.select("#location");

// Load and process data to get unique locations
d3.csv("target_file.csv").then(function (data) {
  d3.csv("test_forecast.csv").then(function (forecastData) {
    const uniqueLocations = Array.from(new Set(data.map(d => d.location_name)));

    // Create a dropdown menu to select the location
    const dropdown = d3.select("#location");

    dropdown.selectAll("option")
      .data(uniqueLocations)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);

    // Parse the date and value fields in the data
    data.forEach(d => {
      d.date = d3.timeParse("%Y-%m-%d")(d.date);
      d.value = +d.value;
    });

    forecastData.forEach(d => {
      d.date = d3.timeParse("%Y-%m-%d")(d.target_end_date);
      d["quantile_0.025"] = +d["quantile_0.025"];
      d["quantile_0.25"] = +d["quantile_0.25"];
      d["quantile_0.5"] = +d["quantile_0.5"];
      d["quantile_0.75"] = +d["quantile_0.75"];
      d["quantile_0.975"] = +d["quantile_0.975"];
    });

    // Initial chart rendering
    updateChart(data, forecastData);

    // Update chart when a new location is selected
    dropdown.on("change", function () {
      updateChart(data, forecastData);
    });

    // Update chart when the credible interval is changed
    d3.selectAll('input[name="credible-interval"]').on("change", function () {
      updateChart(data, forecastData);
    });


  });
});

// Function to update the chart based on the selected location
function updateChart(data, forecastData) {
  const selectedLocation = d3.select("#location").property("value");
  let filteredForecastData = forecastData.filter(d => d.location_name === selectedLocation);
  let filteredData = data.filter(d => d.location_name === selectedLocation);

  // Sort the data by date
  filteredData.sort((a, b) => a.date - b.date);
  filteredForecastData.sort((a, b) => a.date - b.date);

  // Update the x and y scales
  x.domain(d3.extent(filteredData.concat(filteredForecastData), d => d.date));
  y.domain(d3.extent(filteredData.concat(filteredForecastData), d => d.value));

  if (document.querySelector('input[name="credible-interval"]:checked').value === "95") {
    filteredForecastData = filteredForecastData.map(d => ({
      date: d.date,
      value: d["quantile_0.5"],
      lowerBound: d["quantile_0.025"],
      upperBound: d["quantile_0.975"]
    }));
  } else {
    filteredForecastData = filteredForecastData.map(d => ({
      date: d.date,
      value: d["quantile_0.5"],
      lowerBound: d["quantile_0.25"],
      upperBound: d["quantile_0.75"]
    }));
  }

  // Remove the previous chart elements
  svg.selectAll("*").remove();

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));

  // Add Y axis
  svg.append("g").call(d3.axisLeft(y));

  // Add Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Incident daily hospitalisations");

  // Add X axis label
  svg.append("text")
    .attr("transform", `translate(${width / 2},${height + margin.top + 10})`)
    .style("text-anchor", "middle")
    .text("Date");

  // Create the line generator
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value));

  // Add the line path to the SVG element for actual data
  svg.append("path")
    .datum(filteredData)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("d", line);

  // Add the credible interval area for forecast data
  svg.append("path")
    .datum(filteredForecastData)
    .attr("fill", "#c6dfe8")
    .attr("opacity", 1.0)
    .attr("d", d3.area()
      .x(d => x(d.date))
      .y0(d => y(d.lowerBound))
      .y1(d => y(d.upperBound))
    );
  // Add the line path to the SVG element for forecast data
  svg.append("path")
    .datum(filteredForecastData)
    .attr("fill", "none")
    .attr("stroke", "#1a688a")
    .attr("stroke-width", 1)
    .attr("d", line);

  // Add tooltip div
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

  // Add the scatterplot points with tooltip functionality for actual data
  svg.selectAll("dot")
    .data(filteredData)
    .enter().append("circle")
    .attr("r", 6)
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.value))
    .style("fill", "transparent")
    .on("mouseover", function (event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${d3.timeFormat("<strong>%B %d, %Y</strong>")(d.date)}<br><strong>${d.value}</strong> hospitalisations`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Add the scatterplot points with tooltip functionality for forecast data
  svg.selectAll("dot")
    .data(filteredForecastData)
    .enter().append("circle")
    .attr("r", 6)
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.value))
    .style("fill", "transparent")
    .on("mouseover", function (event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${d3.timeFormat("<strong>%B %d, %Y</strong>")(d.date)}<br><strong>${d.value}</strong> hospitalisations`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
}
