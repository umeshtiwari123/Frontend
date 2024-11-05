const mapwidth = 960;
const mapheight = 600;

const mapsvg = d3.select("#map")
    .append("svg")
    .attr("width", mapwidth)
    .attr("height", mapheight);

const projection = d3.geoAlbersUsa()
    .scale(900)
    .translate([mapwidth / 2, mapheight / 2]);

const path = d3.geoPath()
    .projection(projection);

d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(function (us) {
    mapsvg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("class", "state")
        .attr("d", path)
        .on("click", function (event, d) {
            const state = d3.select(this);
            const isSelected = state.classed("selected");

            // Deselect all states
            d3.selectAll(".state").classed("selected", false);

            if (!isSelected) {
                state.classed("selected", true);
                d3.select("#selected-state").text(`${d.properties.name}`);
            } else {
                d3.select("#selected-state").text("US");
            }
        });


    // category column not found so colouring dummy

    const stateValues = {
        "01": 1, // Example values for states
        "02": 2,
        "04": 3,
        "05": 4,
        "06": 5,
        "08": 6,
        "09": 7,
        "10": 8,
        "11": 9,
        "12": 10,
        "13": 11,
        "15": 12,
        "16": 13,
        "17": 14,
        "18": 15,
        "19": 16,
        "20": 17,
        "21": 18,
        "22": 19,
        "23": 20,
        "24": 1,
        "25": 2,
        "26": 3,
        "27": 4,
        "28": 5,
        "29": 6,
        "30": 7,
        "31": 8,
        "32": 9,
        "33": 10,
        "34": 11,
        "35": 12,
        "36": 13,
        "37": 14,
        "38": 15,
        "39": 16,
        "40": 17,
        "41": 18,
        "42": 19,
        "44": 20,
        "45": 1,
        "46": 2,
        "47": 3,
        "48": 4,
        "49": 5,
        "50": 6,
        "51": 7,
        "53": 8,
        "54": 9,
        "55": 10,
        "56": 11
    };

    const colorScale = d3.scaleQuantize()
        .domain([0, d3.max(Object.values(stateValues))])
        .range(d3.schemeBlues[5]);

    mapsvg.selectAll(".state")
        .attr("fill", function (d) {
            const value = stateValues[d.id];
            return value ? colorScale(value) : "#ccc";
        });

    const legendContainer = d3.select("#legend-colorbar");

    const legendData = colorScale.range().map(color => {
        const d = colorScale.invertExtent(color);
        return {
            label: `${Math.round(d[0])}-${Math.round(d[1])}`,
            color: color
        };
    });

    legendData.forEach(item => {
        const legendItem = legendContainer.append("div")
            .attr("class", "legend-item")
        legendItem.append("span")
            .attr("class", "color-box")
            .style("background-color", item.color);
        legendItem.append("span")
            .attr("class", "legend-range")
            .text(item.label);
    });
});