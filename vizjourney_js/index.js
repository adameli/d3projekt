import D3 from './logic/d3.js';
import * as STATE from './logic/state.js';
import { AXIS } from './scales.js';
import { Yscale } from './scales.js';
import * as SCALES from './scales.js';

let _STATE = {};

const colors = {
    PopTotal: '#f1f1f1',
    PopMale: '#488f31',
    PopFemale: '#de425b'
};

const SVG = D3.select( '#vizJourney')
              .append( 'svg')
              .attr( 'height', hSvg)
              .attr( 'width', wSvg);


const VIZ = SVG.append( 'g').attr( 'transform', `translate( ${wPad}, ${hPad})`).classed('VizContainer', true);

const LEGENDS = SVG.append( 'g').attr( 'transform', `translate( ${wPad}, ${hPad - 50})`).classed('LegendContainer', true);

let LegendInx = 0;
for( const [key, color] of Object.entries(colors)) {
    
    const Lgroup = LEGENDS.append( 'g').attr( 'transform', `translate( ${75 * LegendInx})`)
    Lgroup.append( 'circle')
            .attr( 'r', 10)
            .attr( 'fill', color)

    Lgroup.append( 'text')
        .text( key)
        .attr( 'fill', tickColor)
        .attr( 'y', 25)
        .attr( 'text-anchor', 'middle')
        .attr( 'font-size', 10)

    LegendInx++;
}

writeLabels();

const leftAxis = SVG.append( 'g').attr( 'transform', `translate( ${wPad}, ${hPad})`).call( AXIS['left']);
const rightAxis = SVG.append( 'g').attr( 'transform', `translate( ${wViz + wPad}, ${hPad})`).call( AXIS['right']);
styleAxis( [leftAxis, rightAxis]);

async function vizualization(country) {
    
    SVG.selectAll( '.removable').remove();
    SVG.select('.countryText').text( null)

    const LOADING = SVG.append( 'g').attr( 'transform', `translate( ${wSvg / 2}, ${hSvg / 2})`)
        .append( 'text')
        .attr( 'text-anchor', 'middle')
        .text( `LOADING:: ${country}`)
        .attr( 'fill', 'white');
    
    const db = await STATE.get( country);
    
    let currentYear = 0;
    _STATE.currentYear = 0;

    LOADING.remove();

    SVG.select('.countryText').text( country)
    
    //GENERATE DB ARRAY of Each TIME -> [ agegroup dp ]
    let DB = [];
    let lastYear = 0;
    let Yarray = [];
    for( const dp of db) {

        if( lastYear < parseInt(dp.Time)) {
            DB.push( Yarray);
            Yarray = [];
            lastYear = parseInt(dp.Time);
        }
        Yarray.push( dp);
    }
    DB.splice( 0, 1);
    _STATE.DB = DB;
    // GET Top && Bottom Xscales
    // const Xscale = SCALES.getXScale( DB[currentYear]);
    const XscaleTOT = SCALES.getXScale( DB, true);
    _STATE.XscaleTOT = XscaleTOT;
    // const YEARscale = SCALES.getYearScale( DB[currentYear]);
    const YEARscale = SCALES.getYearScale( DB[_STATE.currentYear]);
    // _STATE.YEARscale = YEARscale;
    // STYLE AXIS
    const bottomAxis = SVG.append( 'g').attr( 'transform', `translate( ${wPad}, ${hViz + hPad})`).classed( 'removable', true).call( D3.axisBottom( XscaleTOT));
    const topAxis = SVG.append( 'g').classed('YearAxis', true).classed( 'removable', true).attr( 'transform', `translate( ${wPad}, ${hPad})`).call( D3.axisTop( YEARscale));
    topAxis.selectAll( '.tick text').attr( 'font-size', 25);
    styleAxis( [bottomAxis, topAxis]);

    for( let Type of ['PopTotal', 'PopMale', 'PopFemale']) {
        
        VIZ.selectAll()
            .data( DB[currentYear])
            .enter()
            .append( 'rect')
            .classed( Type, true)
            .classed( 'removable', true)
            .attr( 'height', 2)
            .attr( 'width', 2)
            .attr( 'fill', colors[Type])
            .attr( 'x', d => XscaleTOT( d[Type] * 1000))
            .attr( 'y', d => Yscale( d.AgeGrp));
    }

    setInterval(updateViz, 150)
}

function updateViz() {
    _STATE.currentYear += 1;

    if( _STATE.currentYear === _STATE.DB.length) {
        ClearAllIntervals()
        delete _STATE.currentYear
        return;
    }

    const newScale = SCALES.getYearScale( _STATE.DB[_STATE.currentYear])
    D3.select( '.YearAxis').remove();
    let newAxis = SVG.append( 'g').classed('YearAxis', true).classed('removable', true).attr( 'transform', `translate( ${wPad}, ${hPad})`).call( D3.axisTop( newScale));
    newAxis.selectAll( '.tick text').attr( 'font-size', 25);
    styleAxis([newAxis]);


    for( let Type of ['PopTotal', 'PopMale', 'PopFemale']) {

        VIZ.selectAll( '.' + Type)
            .data( _STATE.DB[_STATE.currentYear])
            .transition()
            .attr( 'x', d => _STATE.XscaleTOT( Math.floor(d[Type] * 1000))) 
            .attr( 'y', d => Yscale( d.AgeGrp));

    }
}

function writeLabels() {
    SVG.append( 'g').attr( 'transform', `translate( ${(wSvg / 2)}, ${hPad + 15})`)
    .append( 'text')
    .attr( 'fill', 'white')
    .attr( 'text-anchor', 'middle')
    .classed( 'countryText', true);

    SVG.append( 'g').attr( 'transform', `translate( ${(wSvg / 2)}, ${(hViz + hPad) + 40})`)
        .append( 'text')
        .attr( 'text-anchor', 'middle')
        .append( 'tspan')
        .text( '⟵ MAX -- ')
        .attr( 'fill', tickColor + 75)
        .attr( 'font-size', 10)
        .append( 'tspan')
        .text( 'Number of Population')
        .attr( 'fill', tickColor)
        .attr( 'font-size', 15)
        .attr( 'font-style', 'italic')
        .append( 'tspan')
        .text( ' -- MIN ⟶')
        .attr( 'fill', tickColor + 75)
        .attr( 'font-style', 'normal')
        .attr( 'font-size', 10)
    
    SVG.append('g').attr( 'transform', `translate( ${wPad - 40}, ${hSvg / 2}) rotate( -90)`)
        .append( 'text')
        .attr( 'text-anchor', 'middle')
        .append( 'tspan')
        .text( '⟵ 0 -- ')
        .attr( 'fill', tickColor + 75)
        .attr( 'font-size', 10)
        .append( 'tspan')
        .text( 'Ages Between')
        .attr( 'fill', tickColor)
        .attr( 'font-size', 15)
        .attr( 'font-style', 'italic')
        .append( 'tspan')
        .text( ' -- 100 ⟶')
        .attr( 'fill', tickColor + 75)
        .attr( 'font-style', 'normal')
        .attr( 'font-size', 10)
}

function styleAxis( ARRAY ) {
    for( let currentAxis of ARRAY) {
        currentAxis.selectAll( '.tick text').attr( 'fill', tickColor).attr( 'font-family', 'georgia');
        currentAxis.selectAll( '.tick line').attr( 'stroke', tickColor + '35');
    }
}

function ClearAllIntervals() {
    for (var i = 1; i < 99999; i++) window.clearInterval(i);
}

(async function(){
    const rqst = new Request( 'https://www.thardemo.com/api/life_journey/entities.php');
    const entities = await ( await fetch( rqst)).json();

    const sortingContainer = document.querySelector( '.results');
    const searchContainer = document.querySelector( '.searchField');
    
    entities.forEach( x => appendEntity( x));
    
    searchContainer.oninput = ( e ) => {
        sortingContainer.innerHTML = null;
        let searchInput = e.target.value;
        let result = entities.filter( e => e.toLowerCase().includes( searchInput.toLowerCase()));

        if( !result.length) {
            sortingContainer.innerHTML = 'No results...';
            return;
        }

        result.forEach( xEntity => appendEntity( xEntity));
    }

    function appendEntity( xEntity) {
        const entityElement = document.createElement( 'li');
        entityElement.textContent = xEntity;

        entityElement.addEventListener('click', () => {
            ClearAllIntervals();
            delete _STATE.currentYear
            vizualization( xEntity);
        })

        sortingContainer.append( entityElement)
    }

})();

// const pauser = ;
document.getElementById( 'pauseButton').onclick = () => {
    console.log( 'click');
    ClearAllIntervals()
};

//STEP FORWARD ONLY UPDATE
document.getElementById( 'playButton').onclick = () => {
    // updateViz();
    setInterval(updateViz, 150)
}
