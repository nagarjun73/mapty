'use strict';





class Workout {
    date = new Date();
    id = (Date.now() + "").slice(-10);

    constructor(coords, distance,duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    }

    _setDescription(){
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

class Running extends Workout {
    type = 'running'
    constructor(coords, distance, duration,cadence){
        super(coords,distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();

    }

    calcPace(){
        // min/km

        this.pace = this.duration/this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling'
    constructor(coords, distance, duration,elevationGain){
        super(coords,distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();

    }

    calcSpeed(){
        // km/hr

        this.speed = this.distance / (this.duration / 60);
        return this.speed;

    }
}

const speed = new Cycling([null, null], 35, 75, null)
console.log(speed)


/////////////////////////////////////////////////////////////////////////////////////////////////////////
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



//APP ARCHITECTURE
class App {


    #map;
    #mapEvent;
    #workouts = []

    constructor() {
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this))

        inputType.addEventListener("change", this._toggleElevationField)
    }

    _getPosition(){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() {
                alert("position not located")
            })
    }

    _loadMap(position){
            const {latitude} = position.coords
            const {longitude} = position.coords

            const coords = [latitude, longitude]

            this.#map = L.map('map').setView(coords, 13);
            // console.log(map)
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this))
    }

    _showForm(mapE) {
        this.#mapEvent = mapE
        form.classList.remove('hidden')
        inputDistance.focus()
    }

    _hideForm(){
        //clear Input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = " "

        form.style.display = 'none';
        form.classList.add('hidden')
        setTimeout(() => (form.style.display = 'grid'), 1000)

    }

    _toggleElevationField(){
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden')

        }


    _newWorkout(e) {
        e.preventDefault();

        //Helper Functions
        const validInputs = (...inputs) =>
            inputs.every((inp) =>
                Number.isFinite(inp)
            )

        const allPositive = (...inputs) => inputs.every((inp) => inp > 0)


        //Get data from form
        const type = inputType.value
        const distance = +inputDistance.value
        const duration = +inputDuration.value
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;

        //If Workout Running create Running object
        if (type === 'running') {
            const cadence = +inputCadence.value
            //Check if data is valid
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence))
                return alert('Inputs have to be Positive Numbers')

            workout = new Running([lat, lng], distance, duration, cadence)
        }

        //If Workout Cycling create Cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value
            //Check if data is valid
            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration))
                return alert('Inputs have to be Positive Numbers')

            workout = new Cycling([lat, lng], distance, duration, elevation)
        }


        //Add new object to Workout Array
        this.#workouts.push(workout)
        console.log(workout)

        //Render Workout on map as marker
        this._renderWorkoutMarker(workout);

        //Render Workout on list
        this._renderWorkout(workout)


        //Hide form + clear Input fields


        this._hideForm(workout)

    }

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            ).setPopupContent(`${workout.type === 'running' ? '🏃‍♂' : '🚴‍♀'} ${workout.description}`)
            .openPopup()
    }


    _renderWorkout(workout){
        let html = `
        <li class="workout workout--${workout.type}" data-id='${workout.id}'>
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂' : '🚴‍♀'}️</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

        if(workout.type === 'running')
            html += `
             <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
            `;

        if(workout.type === 'cycling')
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
            `

        form.insertAdjacentHTML('afterend', html)

    }



}

    const app = new App();







