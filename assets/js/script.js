let searchFormEl = document.querySelector('#search-form'); 
let languageButtonsEl = document.querySelector('#language-buttons'); //buttons to select JS, HTML, CSS
let searchInputEl = document.querySelector('#search-field');
let forecastContainerEl = document.querySelector('#forecast-container');
let locationSpanEl = document.querySelector('#location-display'); // name that comes after "weather forecaast for:"
let modalEl =  document.getElementById('modal');                                    // Modal Window
let modalTitleEl = document.getElementById('modal-title');                         // Modal Title Text
let modalLineOneEl = document.getElementById('modal-line-one');                    // Modal Pragraph line one
let modalLineTwoEl = document.getElementById('modal-line-two');                    // Modal Pragraph line two
let modalOKBtn = document.getElementById('modal-ok')                               // Modal OK button
let modalCloseBtn = document.getElementById('modal-close')                         // Modal Close button (cross)

let apiKey = "ebe9a8cb2cc6f41abc680b652e9804b6";
var lat = "-37.81373321550253";                   // latitude to be populated by co-ordinate API (Default is Melbourne)
var lon = "144.96284987796403";                   // longitude to be populated by co-ordinate API (Default is Melbourne)
var search = ""                                   // search term used
var coordDataArray = [];                          // Object to store coordinate API data returned
var forecastDataArray = [];
var nameAPI = ""                                  // to store city name from Geolocation API
var stateAPI = ""                                 // to store state name from Geolocation API
var countryAPI = ""                               // to store Country code value from Geolocation API

//--------------------------------//
//- Check if Assess Search Value -//
//--------------------------------//

function assessSearchValue(event) {  
  console.log("\n\n\n > assessSearchValue() Called");   
  event.preventDefault();
  search = searchInputEl.value.trim().toLowerCase();         // Set value of global var "search" = value in search field (trimmed and lowercase)
  //console.log("  search captured is: " + search);  
   if (search !=="") {                                       //if search is not blank then execute code block
     console.log("  Submitted search ('" + search + "')"); 
     forecastContainerEl.textContent = '';                   //clear forecast container (list of forecast)
     searchInputEl.value = '';                               //clear search field
     // TO DO: Store search value in local storage
     fetchCoordinates();                                     // Use named city to fetch co-ordinates to use in the weather forecast API
   } else {    
    console.log("  Search field empty - presenting modal alert") //if location is falsy then request location
    modalEl.style.display = "inline";
    modalTitleEl.textContent = "Search field Blank";
    modalLineOneEl.textContent = "Please enter a city name";
    modalLineTwoEl.textContent = "";
   };
   return;
};

// ----------------------------------//
// - Fetch co-ordinates by location -//
// ----------------------------------//
function fetchCoordinates () {
    console.log ("\n\n\n > fetchCoordinates() called");
    var apiCoordinates = "http://api.openweathermap.org/geo/1.0/direct?q=" + search + "&limit=5&appid=" + apiKey;     // to get longitude/latitude info
    console.log("  fetching coordinates from OpenWeather Geocoding API ...");
    fetch(apiCoordinates).then(function (response) {      
        if (response.ok) {
            console.log("  ... fetchCoordinates API Response received");
            response.json().then(function (coordData) {   //store API reponse temporary in "coordData"
            //console.log(coordData);       // Data from API
            //If the "data" array is zero length (i.e. no location found) then present alert indication this, otherwise assign latitude and longtitude to variables
              if ( coordData.length === 0 ) {
                console.log("  Could not match city - presenting modal alert") //if location is falsy then request location
                modalEl.style.display = "inline";
                modalTitleEl.textContent = "Not match found";
                modalLineOneEl.textContent = "Please search with different terms";
                modalLineTwoEl.textContent = "";
                return;
              } else {
                coordDataArray = coordData //store coordData from API into local object "coordDataArray"
                            //for (let i=0; i < coordData.length; i++) {coordDataArray.push(coordData[i]) }; // for loop to push coordData values one at a time into coordDataArray global object
                console.log("  Coordinate API data stored in global variable 'coordDataArray'");
                console.log(coordDataArray);
                lat = coordDataArray[0].lat;
                lon = coordDataArray[0].lon;          
                nameAPI = coordDataArray[0].name;
                countryAPI = coordDataArray[0].country;
                stateAPI = coordDataArray[0].state;
                console.log("  coordDataArray[0] values\n  ------------------------\n  Lat: " + lat + "\n  Lon: " + lon + "\n  Country: " + countryAPI + "\n  Name: " + nameAPI + "\n  State: " + stateAPI);
              };
              fetchForecast();        
            });
        } else {                            
            console.log("  Geolocation API Request Error - presenting modal alert") //if location is falsy then request location
            modalEl.style.display = "inline";
            modalTitleEl.textContent = "Geolocation API request error";
            modalLineOneEl.textContent = "The request to the Geolocation server has return an error, please review and try again.";
            modalLineTwoEl.textContent = "Error response: " + response.statusText + ".";            
        }
    }).catch(function (error) {  // Error message if cannot connect to API server at all
        alert('Unable to connect to Openweathermap Geolocation');
        console.log("  Cannot connect to Geolocation API - presenting modal alert") //if location is falsy then request location
        modalEl.style.display = "inline";
        modalTitleEl.textContent = "Cannot connect to Geolocation Server";
        modalLineOneEl.textContent = "The Geolocation server appears to be offline.";
        modalLineTwoEl.textContent = "Please try again another time.";        
    });
    return;
};

//----------------------------------//
//- Fetch Forecast by co-ordinates -//
//----------------------------------//

function fetchForecast () {
    console.log("\n\n\n > fetchForecast() Called")    
    console.log("Latitude = " + lat)
    console.log("Longitude = " + lon)
    var apiForecast = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=metric&cnt=80&appid=" + apiKey;
    console.log("  fetching forecast from API..");  
    fetch(apiForecast).then(function (response) {      
        if (response.ok) {
            console.log("  ... fetchForecast API Response received");            
            response.json().then(function (forecastData) {  //store API reponse temporary in "forecastData"
            
              if ( forecastData.length === 0 ) {
                console.log("  No weather forecast data found - presenting modal alert") //if no weather location is available then start again
                modalEl.style.display = "inline";
                modalTitleEl.textContent = "No weather forecast available";
                modalLineOneEl.textContent = "The does not have forecast data for the city of interest";
                modalLineTwoEl.textContent = "Please try another city";
                return;
              } else {    
            
              //console.log(forecastData);   // Data from API
                forecastDataArray = forecastData; //store forecastData from API into local object "forecastDataArray"
                console.log(" Forecast API data stored in global variable 'forecastDataArray'");
                console.log(forecastDataArray);
                //console.log("StateAPI: " + stateAPI);   //StateAPI check - still showing a good value     
                displayForecast(); 
              }

            });
        } else {
          console.log("  Weather Forecast API request error - presenting modal alert") //if location is falsy then request location
          modalEl.style.display = "inline";
          modalTitleEl.textContent = "Weather Forecast Server Request Error";
          modalLineOneEl.textContent = "The request to the Weather Forecasting server has returned an error - please review and try again.";
          modalLineTwoEl.textContent = "Error response: " + response.statusText + ".";
        }
    }).catch(function (error) {
      console.log("  Cannot connect to Weather Forecast API - presenting modal alert") //if location is falsy then request location
      modalEl.style.display = "inline";
      modalTitleEl.textContent = "Cannot connect to weather forecasting Server";
      modalLineOneEl.textContent = "The weather forecasting server appears to be offline.";
      modalLineTwoEl.textContent = "Please try again another time.";
    });      
    return;
};

//---------------------//
//- Display Forecast -//
//---------------------//
function displayForecast () {
  console.log("\n\n\n > displayForecast() Called");  
  console.log("  search term used = '" + search + "'"); 
  
  locationSpanEl.textContent = nameAPI + ", " + stateAPI + ", " + countryAPI + "   |   Lat/Lon:   " + lat + ", " + lon;
     
  console.log("  coordDataArray[0] values\n  ------------------------\n  Lat: " + coordDataArray[0].lat + "\n  Lon: " + coordDataArray[0].lon + "\n  Country: " + countryAPI + "\n  Name: " + nameAPI + "\n  State: " + stateAPI);
  
//run single loop for "ID = forecast-one" - or assign values to forecast one ... //
//Or just have HTML there and assign values to first one

// for loop to create remaining forecast. 
// Cards with values:
// Date
// Icon
// Temperature (celcius)
// Wind (km/h)
// Humidity (percentage)

//forcast text, create 3 HTML elements and append
  for (let i = 0; i < forecastDataArray.list.length; i = i+1) {    //increment by 8 to retrieve the value from the same time each day (API provides 3 hourly forecasts)
        
    var AEDT = dayjs.unix(forecastDataArray.list[i].dt).format('ddd, D/M/YYYY, HH:mm:ss A');   // Declare var AEDT store date/time convert from Unix to AEDT
    
    // Declare weatherForecast variable and store weather forecast text 
    
    var forecastCity = "City: " + forecastDataArray.city.name;
    var forecastDate = "Date/Time: " + AEDT + " AEDT";
    var forecastTemp = "Temp: " + forecastDataArray.list[i].main.temp;
    var forecastMinTemp = "Min: " + forecastDataArray.list[i].main.temp_min + "\xB0 C";
    var forecastMaxTemp = "Max: " + forecastDataArray.list[i].main.temp_max + "\xB0 C";
    var forecastWind = "Wind: " + forecastDataArray.list[i].wind.speed + "km/hr";
    var forecastHummidity = "Humidity: " + forecastDataArray.list[i].main.humidity + "%";
    var forecastIcon = "http://openweathermap.org/img/w/" + forecastDataArray.list[i].weather[0].icon + ".png"
    
    let forecastText = i+": " + forecastCity + ", " + forecastDate + ", " + forecastTemp + ", " + forecastMinTemp + ", " + forecastMaxTemp + ", " + forecastWind + ", " + forecastHummidity + ", " + forecastIcon;
    console.log(forecastText);
        
    //Build and append containers
    
    var forecastEl = document.createElement('div');                                       // Declare var forecastEl - create new 'div' element
        forecastEl.classList = 'list-item flex-row justify-space-between align-center';   // Add classes to new 'div' element

    var titleEl = document.createElement('span');                                         // Declare var title El - create new 'span' element
        titleEl.textContent = forecastText;                                                // Add weatherForcast text to the new span element
        forecastEl.appendChild(titleEl);                                                  // Append titleEl (child) to forecastEl (parent)

    var statusEl = document.createElement('span');                                        // Declare Var statusEl  - create new 'span' element
        statusEl.classList = 'flex-row align-center';                                     // Add classes to span element        
        forecastEl.appendChild(statusEl);                                                 // Append statusEl (child) to forecastEl (parent)   
    
    forecastContainerEl.appendChild(forecastEl);                                           // Append forecastEl (parent) to forecastContainerEl (parent)
  }
  //Store search term in local history
};



//-------------------------------------//
//- Function - Render history buttons -//
//-------------------------------------//

//To be called by page load and after rendering forecast


//----------------------------------//
//- Listener - Clear local storage -//
//----------------------------------//

// Button to clear local storage



//--------------------------------------------------//
//- Listener - form submission to "Get Forecast" -//
//--------------------------------------------------//

searchFormEl.addEventListener('submit', function(event) {
  console.log("\n\n\n ! userFormEl Submitted");    
  assessSearchValue(event);
});

//----------------------------------------//
//- Listener - Modal window OK and close -//
//----------------------------------------//

modalOKBtn.addEventListener('click', function() {
  console.log("\n\n\n ! modalOKBtn Clicked")
  modalEl.style.display = "none"
})

modalCloseBtn.addEventListener('click', function() {
  console.log("\n\n\n ! modalCloseBtn Clicked")
  modalEl.style.display = "none"
})

//----------------------------------------------------//
//- Listener - Page Load to generated history buttons-//
//----------------------------------------------------//

//event listener to retrieve storage 


