import D3 from './d3.js';
const path = 'https://www.thardemo.com/api/life_journey/';

const STATE = {};
export async function get( entity ) {

    if( !STATE[entity]) {
        STATE[entity] = await D3.csv( `../../db/lifejourney_db/${entity}.csv`);
    }    
    return STATE[entity]
}