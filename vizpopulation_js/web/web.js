const peopleTransitionContainer = document.getElementById('people-transition-container');

let firstPersonDom = document.createElement('div');
firstPersonDom.id = 'firstPerson';

peopleTransitionContainer.append(firstPersonDom);

for (let i = 0; i < 39; i++) {
    let personDom = document.createElement('div');
    peopleTransitionContainer.append(personDom);
    personDom.classList.add('people');
}
