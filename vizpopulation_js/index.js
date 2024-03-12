import { getDataset } from './dataset/dataset.js';
import * as web from './web/web.js'

//#region regoin buttons
const regions = ['World', 'Africa', 'Asia', 'Europe', 'Northern America', 'Oceania', 'Sweden']
const containerButtons = document.getElementById('container-buttons');

regions.forEach(region => {
    let domButton = document.createElement('button');
    domButton.id = region;
    domButton.classList.add('region-button');
    domButton.textContent = region;
    domButton.addEventListener('click', (e) => {
        document.getElementById('svgContainer').innerHTML = '';
        document.querySelectorAll('.region-button').forEach(button => button.classList.remove('active'))
        e.currentTarget.classList.add('active');
        renderViz(e.currentTarget.textContent);
    })

    if (region === 'World') domButton.classList.add('active');

    containerButtons.append(domButton);
})
//#endregion

const wSvg = 900, hSvg = 700;
const wViz = .8 * wSvg, hViz = .8 * hSvg;
const wPad = (wSvg - wViz) / 3, hPad = 0;
const lineColors = ['rgb(224, 159, 62)', 'rgba(103, 109, 255)', 'rgba(0, 164, 36)', 'rgb(255, 114, 35)'];
const areaColors = ['rgb(224, 159, 62, 30)', ' rgba(103, 109, 255, 30)', 'rgba(0, 164, 36, 30)', 'rgba(255, 114, 35, 30)'];

let svg = d3.select('#svg-container')
    .append('svg')
    .attr('width', wSvg)
    .attr('height', hSvg)
    .attr('id', 'svgContainer')
    ;


async function renderViz(region = 'World') {

    const dataset = await getDataset(region);

    //#region //* creating the x-axis & y-axis, colorScale

    const colorScale = d3.scaleOrdinal([region, 'Young', 'Working', 'Elderly'], lineColors);

    let dates = d3.extent(dataset[0].values, d => d.year);
    let xScale = d3.scaleTime()
        .domain(dates)
        .range([0, wViz])

    let maxPopulation = d3.max(dataset[0].values, d => d.population);
    let yScale = d3.scaleLinear()
        .domain([0, maxPopulation * 1.1])
        .range([hViz, 0])

    let lineMaker = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.population))

    let xAx = svg.append('g')
        .attr('transform', `translate(${wPad}, ${hPad + hViz})`)
        .classed('x-axis', true)
        .call(d3.axisBottom(xScale))

    let yAx = svg.append('g')
        .attr('transform', `translate(${wPad}, ${hPad})`)
        .classed('y-axis', true)
        .call(d3.axisLeft(yScale)
            .tickFormat(d => formatNumber(d, 0)))
    //#endregion

    //#region //* creating the viz, lines, areas & labels
    let gViz = svg.append('g')
        .attr('transform', `translate(${wPad}, ${hPad})`)
        .classed('gViz', true)

    let gLinesPost = gViz.append('g')
        .classed('post-population', true)

    let gLinesEstimat = gViz.append('g')
        .classed('estimat-population', true)

    let gLineLabels = gViz.append('g')
        .classed('line-labels', true)

    let gArea = gViz.append('g')
        .classed('area', true)

    gLinesPost.selectAll('postLines')
        .data(dataset)
        .enter()
        .append('path')
        .attr('d', d => lineMaker(d.postValues))
        .classed('line', true)
        .attr('id', d => 'post-' + d.name.replace(' ', ''))
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .attr('stroke', (d, i) => lineColors[i])
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')

    gLinesEstimat.selectAll('estimateLines')
        .data(dataset)
        .enter()
        .append('path')
        .attr('d', d => lineMaker(d.estimatValues))
        .classed('line', true)
        .attr('id', d => 'estimat-' + d.name.replace(' ', ''))
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .attr('stroke', (d, i) => lineColors[i])
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .style("stroke-dasharray", ("4, 4"))

    gLineLabels.selectAll('labels')
        .data(dataset)
        .enter()
        .append('text')
        .html(d => `${d.name}`)
        .attr('x', wViz + 10)
        .attr('y', findLastYear)

    function findLastYear(d, i, nodes) {
        const lastYearsPopulation = d.values.find(ageGrp => ageGrp.year.getFullYear() === 2101).population;
        return yScale(lastYearsPopulation);
    }

    const area = d3.area()
        .x(d => xScale(d.year))
        .y0(hViz)
        .y1(d => yScale(d.population))

    gArea.selectAll('tot-pop-area')
        .data(dataset)
        .enter()
        .append('path')
        .classed('area', true)
        .attr('id', d => 'area-' + d.name.replace(' ', ''))
        .attr('d', d => area(d.values))
        .style('fill', (d, i) => areaColors[i])
        .style('opacity', .5)
    //#endregion

    //#region  //* creating the data-points, tooltip, tool-line, listening-rect
    let gPoints = gViz.append('g')
        .classed('data-points', true)

    let categories = dataset.map(d => d.name)
    categories.forEach((category, index) => {
        gPoints.append('circle')
            .classed('circle-point', true)
            .attr('id', 'data-' + category.replace(' ', ''))
            .attr('r', 0)
            .attr('fill', colorScale(category))
            .style('stroke', 'white')
            .attr('opacity', 1)
            .style('pointer-events', 'none')
    })


    const tooltip = d3.select('.tooltip');


    const tooltipLineX = gViz.append('line')
        .attr('class', 'tooltip-line')
        .attr('id', 'tooltip-line-x')
        .attr('stroke', 'grey')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2.2')

    const listeningRect = gViz.append('rect')
        .classed('listening-rect', true)
        .attr('width', wViz)
        .attr('height', hViz)
        .style('fill', 'none')


    listeningRect.on('mousemove', function (event) {

        let stats = []
        let xPosLine = 0;

        dataset.forEach((element) => {

            const [xCoord] = d3.pointer(event, this);
            const bisectDate = d3.bisector(d => d.year).left;
            const x0 = xScale.invert(xCoord);
            const i = bisectDate(element.values, x0, 1);
            const d0 = element.values[i - 1];
            const d1 = element.values[i];
            const d = x0 - d0.year > d1.year - x0 ? d1 : d0;
            const xPos = xScale(d.year)
            const yPos = yScale(d.population)

            d3.select(`#data-${element.name.replace(' ', '')}`).attr('cx', xPos).attr('cy', yPos);
            d3.select(`#data-${element.name.replace(' ', '')}`).transition()
                .duration(50)
                .attr('r', 5)

            stats.push(d)
            xPosLine = xPos
        })

        tooltipLineX.style('display', 'block').attr('x1', xPosLine).attr('x2', xPosLine).attr('y1', 0).attr('y2', hViz);

        tooltip
            .style("display", "block")
            .html(` 
            <div class="tooltip-header">
                <p id="year">${stats[0].year.getFullYear()}</p>
                <p id="type">in people</p>
            </div>
            <div class="stats">
                <div class='left-content'>
                    <div class="square" style='background-color:${colorScale(stats[0].category)};'></div>
                    <p class="category">${region} population</p>
                </div>
                <p class="population">${formatNumber(stats[0].population, 2)}</p>
            </div>
            <div class="stats">
                <div class='left-content'>
                    <div class="square" style='background-color:${colorScale(stats[2].category)};'></div>
                    <p class="category">Working (15-65 years)</p>
                </div>
                <p class="population">${formatNumber(stats[2].population, 2)}</p>
            </div>
            <div class="stats">
                <div class='left-content'>
                    <div class="square" style='background-color:${colorScale(stats[1].category)};'></div>
                    <p class="category">Young (0-14 years)</p>
                </div>
                <p class="population">${formatNumber(stats[1].population, 2)}</p>
            </div>
            <div class="stats">
                <div class='left-content'>
                    <div class="square" style='background-color:${colorScale(stats[3].category)};'></div>
                    <p class="category">Elederly (66-100 years)</p>
                </div>
                <p class="population">${formatNumber(stats[3].population, 2)}</p>
            </div>
            `);

    });

    function formatNumber(number, decimal) {
        if (number > 1000000000) {
            const billions = number / 1000000000;
            return billions.toFixed(decimal) + ' billion';
        } else {
            const millions = number / 1000000;
            return millions.toFixed(decimal) + ' million';
        }
    }
    listeningRect.on("mouseleave", function () {
        d3.selectAll('.circle-point').transition().duration(50).attr("r", 0);
        tooltip.style("display", "none");
        tooltipLineX.attr("x1", 0).attr("x2", 0);
        tooltipLineX.style("display", "none");
    });
    //#endregion

    //#region //* creating the slider
    const sliderRange = d3.sliderBottom()
        .min(d3.min(dataset[0].values, d => d.year))
        .max(d3.max(dataset[0].values, d => d.year))
        .width(400)
        .tickFormat(d3.timeFormat('%Y'))
        .default([d3.min(dataset[0].values, d => d.year), d3.max(dataset[0].values, d => d.year)])
        .fill(areaColors[0])

    sliderRange.on('onchange', val => {
        xScale.domain(val);
        const filteredData = dataset[0].values.filter(d => d.year >= val[0] && d.year <= val[1]);
        yScale.domain([0, d3.max(filteredData, d => d.population) * 1.1]);

        svg.select('.x-axis')
            .transition()
            .duration(300)
            .call(d3.axisBottom(xScale))

        svg.select('.y-axis')
            .transition()
            .duration(300)
            .call(d3.axisLeft(yScale)
                .tickFormat(d => formatNumber(d, 0)))

        dataset.forEach(element => {
            const filteredAgeData = element.values.filter(d => d.year >= val[0] && d.year <= val[1]);
            const postValues = filteredAgeData.filter(d => d.year.getFullYear() <= 2024)
            const estimatValues = filteredAgeData.filter(d => d.year.getFullYear() > 2024)

            gViz.select(`#post-${element.name.replace(' ', '')}`).attr('d', lineMaker(postValues));
            gViz.select(`#estimat-${element.name.replace(' ', '')}`).attr('d', lineMaker(estimatValues));
            gViz.select(`#area-${element.name.replace(' ', '')}`).attr('d', area(filteredAgeData));

        })
    })

    let gRange = svg.append('svg')
        .attr('id', 'slider-range')
        .attr('width', 500)
        .attr('height', 100)
        .attr('transform', `translate(${wPad}, ${hViz + hPad + 20})`)
        .append('g')
        .attr('transform', `translate(20, 30)`)

    gRange.call(sliderRange);
    //#endregion

}

renderViz();



