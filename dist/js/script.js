const mainContainer = document.querySelector('.main-container'),
      pickupDate = document.querySelector('#pickup'),
      returnDate = document.querySelector('#return'),
      passengerInput = document.querySelector('.passengers'),
      detailContainer = document.querySelector('.detail-container'),
      transportationContainer = document.querySelector('.transportation-container'),
      fuelInfo = [],
      submitBtn = document.querySelector('.submitBtn'),
      quoteWrapper = document.querySelector('.quoteWrapper');
      quoteBtn = document.querySelector('.quoteBtn'),
      quoteInfo ={},
      coordsArray = [],
      fuelPerLiter = 2;
     

async function loadTransportationData(){
    return await fetch("./json/transportation.json")
    .then(response => response.json())
    .then(data => data)
    .catch(error => new Error('Error detected')); 
}

async function loadGeolocationData(){
    return await fetch("./json/geolocation.json")
    .then(response => response.json())
    .then(data => data)
    .catch(error => new Error('Error detected')); 
}

function getStart(){
    const getStartBtn = document.querySelector('.startBtn');
    const wrapperContainer = document.querySelector('.wrapper');

    getStartBtn.addEventListener('click', ()=> {
      
        wrapperContainer.classList.add('move');
    })
   
}

function datePicker(){
    const dateOption = {
       minDate:'today',
       altInput: true,
       altFormat:'F j, Y',
       dateFormat: 'Y-m-d'      
    };

    $('#pickup').flatpickr(dateOption);
    $('#return').flatpickr(dateOption);
    
}

function filteredByPassenger(data){
    const showOfferBtn = document.querySelector('.showOfferBtn');
    const formTitle = document.querySelector('.formTitle');
    const formContainer = document.querySelector('.form-container');
        showOfferBtn.addEventListener('click', (e)=> {
            document.querySelector('body').style.overflow="visible";
            const passengerNum = passengerInput.value;
            const labels = document.querySelector('.form-container').querySelectorAll('label');
            mainContainer.style.height="auto";
            for(let item of labels){
                item.style.color = "#85C283";
            }
            
             if(pickupDate.value === returnDate.value){
                alert('Not able to select same pickup & return date');
            }else if(calculateDay()> 15){
               
                    alert(`There is no available options for over ${calculateDay()} rent days`)
                    
            }
            else if(passengerNum && pickupDate.value && returnDate.value){
                e.preventDefault();
                formTitle.style.display="none";
                formContainer.style.backgroundColor ="#666";
                displayTransportation(data, Number(passengerNum));
                showNavbar();
                movingForm();
                changeBackground();
                showTransportationDetail(data);
                
            }
            else {
                alert('You should fill both date section and passengers section')
            }

        })
    
    
}

function displayTransportation(data, passenger){
    const filteredByPassengerArray = data.filter(item => 
        passenger >= item.minPassenger && passenger <= item.maxPassenger
    )
    transportationContainer.innerHTML = filteredByPassengerArray.map(item => createTransportationItem(item)).join('')
}


function createTransportationItem(item){
    return `
         <li class="transportation-item" data-id="${item.id}">
            <h1 class="transportation-name">${item.name}</h1>
            <img class="transportation-img" src="${item.imgSrc}" alt="">
            <div class="transportatione-price">
                <p class="dayPrice">$ ${item.dayPrice} day</p>
                <p class="dayTotalPrice">$ ${item.dayPrice * calculateDay()} total</p>
            </div>
        </li>   
    `;
}

function showNavbar(){
    const navbar = document.querySelector('.navbar');
    navbar.style.transition="opacity 1s ease"
    navbar.classList.add('showNav');
}
function movingForm(){
    const form = document.querySelector('.form');
    form.classList.add('formMove')
    form.style.position="relative";
    form.style.width="100%";
    form.style.transition = "all 1s ease";
}
function changeBackground(){
    mainContainer.style.transition="all 1s ease";
    mainContainer.style.backgroundImage = "none";
    mainContainer.style.backgroundColor="#313635"
}

function calculateDay(){
     const pickupDate = new Date($('#pickup').val()).getTime();
     const returnDate = new Date($('#return').val()).getTime();
     quoteInfo.pickupDate = $('#pickup').val();
     quoteInfo.returnDate = $('#return').val();
    const dayTime = 1000 * 60 * 60 * 24;
    const   day= (returnDate - pickupDate)/dayTime ;
    return day;
}



function showTransportationDetail(data){
    const transportations = document.querySelectorAll('.transportation-item');
    const itemArray =[...transportations];
    
    itemArray.forEach(item => item.addEventListener('click', ()=> {
         itemData = data.filter(data => data.id === Number(item.dataset.id))[0];
        detailContainer.innerHTML = createTransportationDetail(itemData);
        detailContainer.classList.add('flow');
        addLocationForm();
        getFuelConsumption(itemData)
    }))
   
}

function createTransportationDetail(data){
    quoteInfo.vehicleName = data.name;
    quoteInfo.vehicleCost = data.dayPrice * calculateDay();
    quoteInfo.vehicleImgSrc = data.imgSrc;
    quoteInfo.maxPassenger = data.maxPassenger;
    return `
        <div class="detailItem-info">
            <h1 class="detailItem-name">${data.name}</h1>
            <ul class="detailItem-options">
                <li class="detailItem-option">
                    <span class="iconify" data-inline="false" data-icon="majesticons:users-line" ></span>
                    <p>${data.maxPassenger} seats</p>
                </li>
                <li class="detailItem-option">
                    <span class="iconify" data-inline="false" data-icon="mdi:car-door"></span>
                    <p>${data.maxPassenger} doors</p>
                </li>
                <li class="detailItem-option">
                    <span class="iconify" data-inline="false" data-icon="tabler:manual-gearbox" ></span>
                    <p>Automatic</p>
                </li>
                <li class="detailItem-option">
                    <span class="iconify" data-inline="false" data-icon="ic:round-ac-unit" ></span>
                    <p>A / C</p>
                </li>
            </ul>
            <img src="${data.imgSrc}" alt="transportation" class="detailItem-image">
        </div>
        <div class="detailItemPrice-container">
            <div class="detailItem-price">
                <p>TOTAL</p>
                <p class="price">$ ${data.dayPrice * calculateDay()}</p>
            </div>
            <p class="tax">Tax included</p>
            <button class="selectBtn">SELECT</button>
        </div>
    
    `;
}

function addLocationForm(){
    const selectBtn = document.querySelector('.selectBtn');
    const detailItemPriceContainer = document.querySelector('.detailItemPrice-container');
    const locationForm = document.querySelector('.locationForm');

    selectBtn.addEventListener('click', ()=> {
        transportationContainer.style.display="none";
        detailContainer.classList.add('change');
        locationForm.style.visibility="visible";
        
        detailContainer.append(locationForm)
        makeMapContainer();
    })
}

function makeMapContainer(){
    const mapContainer = document.querySelector('.map-container');
    mapContainer.classList.add('show');
    loadGeolocationData()
        .then(data => markOnMap(data.geolocation)
    ) ;  
    
}




function markOnMap(data){
    let mymap= L.map('mapid').setView([-38.537613692644236, 176.081620026835], 5.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);
        
    let startMarker = null;
    let destinationMarker = null;
    let routing;
    var startIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [15, 25],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [10,10]
      });

      var destinationIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [15, 25],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [10,10]
      });


   const startPoint = document.querySelector('#startPoint');
   const destinationPoint = document.querySelector('#destinationPoint');
    
   
   startPoint.addEventListener('change', ()=> {
    window.scrollTo(0,document.body.scrollHeight);

       if(startPoint.value === destinationPoint.value){
            alert('You should choose another city');
            return;
       }
       if(startMarker){
           mymap.removeLayer(startMarker);
       }

       quoteInfo.startPoint = startPoint.value;
       const geoData = data.filter(item => item.cityName === startPoint.value);
       const startPointCoords = [geoData[0].latitude, geoData[0].longitude];
        startMarker = new L.marker(startPointCoords, {icon:startIcon}) ;
        coordsArray[0] = startMarker.getLatLng();
        const startMarkOnMap = startMarker.addTo(mymap)
        if(coordsArray.length ===2){
            getDistance(coordsArray[0], coordsArray[1]);
        }
       
       
        if(coordsArray.length ===2){
            makePath(mymap);
        }
   })
   
   destinationPoint.addEventListener('change', ()=> {

       if(startPoint.value === destinationPoint.value){
           alert('You should choose another city');
           return;
       }
       if(!startPoint.value){
           alert('You should choose start point first !');
           return;
       }
       if(destinationMarker){
           mymap.removeLayer(destinationMarker)
       }
       quoteInfo.destinationPoint = destinationPoint.value;

        const geoData = data.filter(item => item.cityName === destinationPoint.value);
        const destinationPointCoords = [geoData[0].latitude, geoData[0].longitude];
         destinationMarker =  L.marker(destinationPointCoords,{icon:destinationIcon});
        coordsArray[1] = destinationMarker.getLatLng();
        const destinationMarkerOnMap= destinationMarker.addTo(mymap)
        getDistance(coordsArray[0], coordsArray[1]);
      
       if(coordsArray.length===2){
           makePath(mymap, coordsArray);
       }
    })
    
}

function makePath(map, coordsArray){
   
   rountng = L.Routing.control({
        lineOptions: {
            styles: [{ color: 'blue', opacity: 1, weight: 3 }]
        },
        waypoints: [
          L.latLng(coordsArray[0].lat, coordsArray[0].lng),
          L.latLng(coordsArray[1].lat, coordsArray[1].lng)
        ],
        createMarker: function (i, waypoint, n) {
            const marker = L.marker(waypoint.latLng, {
              draggable: true,
              bounceOnAdd: false,
              bounceOnAddOptions: {
                duration: 1000,
                height: 800, 
                function() {
                  (bindPopup(myPopup).openOn(map))
                }
              },
              icon: L.icon({
                iconUrl: './asset/middle.svg',
                iconSize: [30, 25],
                iconAnchor: [22, 25],
                popupAnchor: [-3, -76],
                
              })
            });
            return marker;
          }
      }).addTo(map);
}

    function getDistance(from, to){
        const distanceSection = document.querySelector('.distance');
        const distance = (from.distanceTo(to).toFixed(0)/1000).toFixed(0);
        distanceSection.innerText = `Distance : ${distance} km`;
        fuelInfo[0] = Number(distance);
    }

    function getFuelConsumption(data){
        const fuelConsumptionSection = document.querySelector('.fuelConsumption');
        fuelConsumptionSection.innerText = `Fuel Consumption : ${data.fuelPrice}L / 100km`;
        fuelInfo[1]= data.fuelPrice;
    }

    submitBtn.addEventListener('click', (e)=> {
        const fuelInfoContainer = document.querySelector('.fuelInfo-container');
        if(coordsArray.length===2){
            e.preventDefault();
            
            if(fuelInfo.length ===2){
                const calculateFuelCosts = ((fuelInfo[0]/100) * fuelInfo[1]*fuelPerLiter).toFixed(1);
                quoteInfo.fuelCost = Number(calculateFuelCosts);
    
                fuelCosts = document.querySelector('.fuelCosts');
                fuelCosts.innerText = `Estimated fuel costs : $ ${calculateFuelCosts}`;
                fuelInfoContainer.classList.add('fuelShow');

                 makeQuote();

            }
        }
       
    })

   function makeQuote(){
        quoteBtn.addEventListener('click', ()=> {
            quoteWrapper.classList.add('visible');
            quoteInfo.totalCost = quoteInfo.fuelCost + quoteInfo.vehicleCost;
            quoteWrapper.innerHTML = createQuote();
         })
         closeQuote();
   }

   function createQuote(){
       return `
       <div class="quoteModal">
            <p class="quote-greeting">Great Deal !</p>
            <div class="vehicle-info">
                <p class="quoteVehicle-name">${quoteInfo.vehicleName}</p>
                <ul class="quote-vehicleDetail">
                    <li class="quote-vehicleOption">
                        <span class="iconify" data-inline="false" data-icon="majesticons:users-line" ></span>
                        <p>${quoteInfo.maxPassenger} seats</p>
                    </li>
                    <li class="quote-vehicleOption">
                        <span class="iconify" data-inline="false" data-icon="mdi:car-door"></span>
                        <p>${quoteInfo.maxPassenger} doors</p>
                    </li>
                    <li class="quote-vehicleOption">
                        <span class="iconify" data-inline="false" data-icon="tabler:manual-gearbox" ></span>
                        <p>Automatic</p>
                    </li>
                    <li class="quote-vehicleOption">
                        <span class="iconify" data-inline="false" data-icon="ic:round-ac-unit" ></span>
                        <p>A / C</p>
                    </li>
                </ul>
                <img src="${quoteInfo.vehicleImgSrc}" alt="vehicleImg">
            </div>
            <div class="journey-info">
                <p class="quote-date">${quoteInfo.pickupDate} - ${quoteInfo.returnDate}</p>
                <p class="quote-path">${quoteInfo.startPoint} to ${quoteInfo.destinationPoint}</p></div>
            <div class="vehicle-cost">
                <p class="quote-vehicleCost">Vehicle Cost :\n $ ${quoteInfo.vehicleCost}</p>
                <p class="quote-vehicleFuelCost">Fuel Cost :\n $ ${quoteInfo.fuelCost} </p>
                <p class="quote-totalCost">TOTAL :\n $ ${quoteInfo.totalCost}</p>
            </div>
            <button class="paymentBtn">PAYMENT</button>
        </div>
       `
   }

   function closeQuote(){
        quoteWrapper.addEventListener('click', ()=> {
            quoteWrapper.classList.remove('visible');
        })
    }


function moveToInitialPage(){
    const homeBtn = document.querySelector('.homeBtn');
    homeBtn.addEventListener('click', ()=> {
       location.reload();

        })
    
}


function init(){
    getStart();
   datePicker();
   moveToInitialPage();
}

init();

loadTransportationData()
   .then(data => {
    filteredByPassenger(data.transportation);
   });



