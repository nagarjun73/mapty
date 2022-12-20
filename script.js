'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



class Workout {
    date = new Date();
    id = (Date.now() + "").slice(-10);

    constructor(coords, distance,duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    }
}

class Running extends Workout {
    constructor(coords, distance, duration,cadence){
        super(coords,distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace(){
        // min/km

        this.pace = this.duration/this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    constructor(coords, distance, duration,elevationGain){
        super(coords,distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        }

    calcSpeed(){
        // km/hr

        this.speed = this.distance / (this.duration / 60);
        return this.speed;

    }
}

const speed = new Cycling([null, null], 35, 75, null)
console.log(speed)


//APP ARCHITECTURE
class App {
    #map;
    #mapEvent;

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

    _toggleElevationField(){
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden')

        }


    _newWorkout(e){
        e.preventDefault();

        //clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = " "

        //Display Marker
        const { lat, lng } = this.#mapEvent.latlng;
        console.log(lat, lng)
        L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth:250,
                    minWidth:100,
                    autoClose: false,
                    closeOnClick: false,
                    className: 'running-popup',
                })
            ).setPopupContent('workout')
            .openPopup()
    }
}

    const app = new App();







