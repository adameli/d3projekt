
export async function getDataset(region = 'World') {

    let dataset = [
        {
            name: region, values: [], postValues: '', estimatValues: '',
        },
        {
            name: 'Young', values: [], postValues: '', estimatValues: ''
        },
        {
            name: 'Working', values: [], postValues: '', estimatValues: ''
        },
        {
            name: 'Elderly', values: [], postValues: '', estimatValues: ''
        }
    ]

    const dataAgeGroups = await d3.csv(`./db/population_db/${region}.csv`, d => {
        return {
            year: new Date(d.Time),
            ageGrp: d.AgeGrp,
            ageGrpStart: +d.AgeGrpStart,
            location: d.Location,
            population: Math.round(+d.PopTotal * 1000)
        }
    });

    let first_year = Infinity;
    let end_year = 0;

    dataAgeGroups.forEach(d => {
        let year = d.year.getFullYear();
        first_year = Math.min(first_year, year)
        end_year = Math.max(end_year, year)
    });

    let years = [];
    for (let year = first_year; year <= end_year; year++) {
        let stringYear = year.toString();
        years.push(new Date(stringYear))
    }

    years.forEach(year => {

        const ageGroupsByYear = dataAgeGroups.filter(d => d.year.getFullYear() === year.getFullYear())
        let wpSum = 0;
        let agePopSum = 0;

        for (let d of ageGroupsByYear) {
            let ageStart = d.ageGrpStart;
            wpSum += d.population;

            if (ageStart < 11) {
                agePopSum += d.population;
                if (ageStart === 10) {
                    dataset.find(element => element.name === 'Young').values.push(createObject(agePopSum, year, 'Young'));
                    agePopSum = 0;
                    continue
                }
            }

            if (ageStart > 14 && ageStart < 61) {
                agePopSum += d.population;
                if (ageStart === 60) {
                    dataset.find(element => element.name === 'Working').values.push(createObject(agePopSum, year, 'Working'));
                    agePopSum = 0;
                    continue
                }
            }

            if (ageStart > 64) {
                agePopSum += d.population;
                if (ageStart === 100) {
                    dataset.find(element => element.name === 'Elderly').values.push(createObject(agePopSum, year, 'Elderly'));
                    agePopSum = 0;
                    continue
                }
            }
        }

        dataset.find(element => element.name === region).values.push(createObject(wpSum, year, region));

    });

    function createObject(pop, year, cat) {
        let obj = {
            population: pop,
            year: year,
            category: cat
        }

        return obj
    }

    dataset.forEach(element => {
        const postPopulation = element.values.filter(d => d.year.getFullYear() <= 2024)
        const estimatPopulation = element.values.filter(d => d.year.getFullYear() > 2024)

        element.postValues = postPopulation;
        element.estimatValues = estimatPopulation;
    })
    console.log(dataset);

    return dataset;
}