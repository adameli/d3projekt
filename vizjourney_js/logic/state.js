import D3 from './d3.js';

const STATE = {};
export async function get( entity ) {

    if( !STATE[entity]) {
        STATE[entity] = await D3.csv( `../../db/tmp/${entity}.csv`);
        // STATE[entity] = await D3.csv( `../../../../api/life_journey/db/${entity}.csv`);
    }    
    return STATE[entity]
}