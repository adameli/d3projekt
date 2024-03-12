import D3 from './logic/d3.js';

export const Yscale = D3.scaleLinear([0, 100], [hViz, 0]);
const maxminScale = D3.scaleBand( ['← MAX', 'MIN →'], [0, wViz]);

export const AXIS = {
    left: D3.axisLeft( Yscale).tickSize( -wViz),
    right: D3.axisRight( Yscale).ticks(50),
    top: D3.axisTop( maxminScale),
};

export function getXScale( data, bool ) {
    let MAX = 0;
    if( !bool) {
        MAX = Math.max(...data.map( x => x.PopTotal * 1000));
    }
    
    if( bool) {
        MAX = Math.max(...data.map( x => Math.max(...x.map( y => y.PopTotal * 1000))));
    } 
    
    return( D3.scaleLinear([MAX, 0], [0, wViz]));
}

export function getYearScale( data ) {
    return( D3.scaleBand([data[0].Time], [0, wViz]));
}
