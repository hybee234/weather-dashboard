var searchFormEl = document.querySelector('#search-form'); 
var languageButtonsEl = document.querySelector('#language-buttons'); //buttons to select JS, HTML, CSS
var searchInputEl = document.querySelector('#search-field');
var forecastContainerEl = document.querySelector('#forecast-container');
var locationSpanEl = document.querySelector('#location-display'); // name that comes after "weather forecaast for:"

var apiKey = "ebe9a8cb2cc6f41abc680b652e9804b6";
var lat = "-37.81373321550253";   // latitude to be populated by co-ordinate API (Default is Melbourne)
var lon = "144.96284987796403";   // longitude to be populated by co-ordinate API (Default is Melbourne)
var search = ""
var coordDataArray = [];          // Object to store coordinate API data returned
var forecastDataArray = [];
var nameAPI = "" // to store city name from API
var stateAPI = ""  //to store state name from API
var countryAPI = "" // to store Country code value from API

//------------------------------//
//- Check if location is empty -//
//------------------------------//

function checkSearchEmpty(event) {  
  console.log("\n\n\n > checkSearchEmpty() Called");   
  event.preventDefault();
  search = searchInputEl.value.trim().toLowerCase();         // Set value of global var "location" = value in search field (trimmed and lowercase)
  console.log("  search captured is: " + search);  
   if (search !=="") {                           //if search is truthy then execute code block
     console.log("  search not empty - Good"); 
     forecastContainerEl.textContent = '';         //clear forecast container (list of forecast)
     searchInputEl.value = '';                    //clear search field
     fetchCoordinates();                      // Use named location to fetch co-ordinates to use in the weather forecast API
   } else {
    console.log("  search is empty - bad")  
    alert('Please enter a location');        //if location is falsy then request location    
   };
   return;
};

//-------------------------------//
//- Prepare request by language - TO UPDATE -//
// //-------------------------------//
// function buttonClickHandler (event) {
//   console.log("\n\n\n > buttonClickHandler() Called")  
//   var language = event.target.getAttribute('data-language');  // declare local var "language" = data-language value of element that triggered

//   if (language) {                     // if language is truthy then carry out the block
//     getFeaturedRepos(language);       // execute getFeaturedRepos wit
//     forecastContainerEl.textContent = ''; //clear any existing repo/weather forecast displayed.
//   }
// };

// ----------------------------------//
// - Fetch co-ordinates by location -//
// ----------------------------------//
function fetchCoordinates () {
    console.log ("\n\n\n > fetchCoordinates() called");
    var apiCoordinates = "http://api.openweathermap.org/geo/1.0/direct?q=" + search + "&limit=5&appid=" + apiKey;     // to get longitude/latitude info
    console.log("  fetching coordinates from API ...");
    fetch(apiCoordinates).then(function (response) {      
        if (response.ok) {
            console.log("  ... API Response received (see below)");
            response.json().then(function (coordData) {   //store API reponse temporary in "coordData"
            console.log(coordData);       // Data from API
            //If the "data" array is zero length (i.e. no location found) then present alert indication this, otherwise assign latitude and longtitude to variables
              if ( coordData.length === 0 ) {
                alert ('No location found - please try again');
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
            alert('Error in co-ordinates: ' + response.statusText); // Can connect to API server but error sent back
        }
    }).catch(function (error) {  // Error message if cannot connect to API server at all
        alert('Unable to connect to Openweathermap Geolocation');
    });
    return;
};

//----------------------------------//
//- Fetch Forecast by co-ordinates -//
//----------------------------------//

function fetchForecast () {
    console.log("\n\n\n > fetchForecast() Called")
    //console.log("  search = " + search)
    var apiForecast = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=metric&cnt=80&appid=" + apiKey;
    console.log("  fetching forecast from API..");  
    fetch(apiForecast).then(function (response) {      
        if (response.ok) {
            console.log("  ... API Response received (see below)");            
            response.json().then(function (forecastData) {  //store API reponse temporary in "forecastData"
            console.log(forecastData);   // Data from API
                forecastDataArray = forecastData; //store forecastData from API into local object "forecastDataArray"
                console.log(" Forecast API data stored in global variable 'forecastDataArray'");
                console.log(forecastDataArray);
                console.log("StateAPI: " + stateAPI);   //StateAPI check - still showing a good value     
            displayForecast(); 
            });
        } else {
          alert('Error in forecast: ' + response.statusText); // Can connect to API server but error sent back
        }
    }).catch(function (error) {
       alert('Unable to connect to Openweathermap forecast');
    });      
    return;
};

//---------------------------//
//- Fetch Repos by Language -//
// //---------------------------//
// function getFeaturedRepos (language) {
//   console.log("\n\n\n > getFeaturedRepos() Called")  
//   var apiUrl = 'https://api.github.com/search/repositories?q=' + language + '+is:featured&sort=help-wanted-issues';

//   fetch(apiUrl)  //fetch URL above
//   .then(function (response) {   //then do something with the response
//     console.log(" function response initiating")
//     if (response.ok) {
//       console.log("response OK");
//       response.json()     //convert response into json object
//       .then(function (data) {   //Data now in JSON Format
//         console.log(data);
//         displayRepos(data.items, location);
//       });
//     } else {
//       alert('Error: ' + response.statusText);
//     }
//   })
//   .catch(function (error) {
//     alert('Unable to connect to Openwetahermap');
//   });
// };

//---------------------//
//- Display Forecaset -//
//---------------------//
function displayForecast () {
  console.log("\n\n\n > displayForecast() Called");
  console.log("  ****TEST StateAPI: " + stateAPI);   //StateAPI check - still showing a good value
  console.log("  search term used = '" + search + "'"); 
  
  //Checking if forecastDataArray has zero length (i.e. no values)
  if (forecastDataArray.length === 0) {
    forecastContainerEl.textContent = 'No weather forcasts found.';    
  } 
  console.log("  ****TEST StateAPI: " + stateAPI);   //StateAPI check
  //Updating subtitle text to show city, state, country of weather forecast
  if (!stateAPI) { 
    console.log ("  StateAPI value =" + stateAPI);
    locationSpanEl.textContent = nameAPI + ", test falsy " + stateAPI + " test falsy" + countryAPI + "   |   Lat/Lon:   " + lat + ", " + lon;     // Come back to delete the "test falsy and State API values out of this line"
  } else {
    locationSpanEl.textContent = nameAPI + ", " + stateAPI + ", " + countryAPI + "   |   Lat/Lon:   " + lat + ", " + lon;
  }
  console.log("  ****TEST StateAPI: " + stateAPI);   //StateAPI check
  
  console.log("  coordDataArray[0] values\n  ------------------------\n  Lat: " + coordDataArray[0].lat + "\n  Lon: " + coordDataArray[0].lon + "\n  Country: " + countryAPI + "\n  Name: " + nameAPI + "\n  State: " + stateAPI);

  // Compare "search" and "city" name returned in API" for a match (if no match then a nearby location has been selected based on co-ordinates)
  // console.log("  checking if search term and cityAPI match:")
  // if (nameAPI.trim().toLowerCase() === search) {}
  console.log ("  coordDataArray\n  --------------")
  console.log (coordDataArray);

// for loop to create forcast text, create 3 HTML elements and append
  for (var i = 0; i < 50 || i < forecastDataArray.length; i = i+8) {    //increment by 8 to retrieve the value from the same time each day (API provides 3 hourly forecasts)
    
                            // Declare var AEDT store date/time convert from Unix to AEDT
    var AEDT = dayjs.unix(forecastDataArray.list[i].dt).format('ddd, D/M/YYYY, HH:mm:ss A');   // TO DO *** Can remove time at the end
                           // Declare weatherForecast variable and store weather forecast text 
    var forecastText = i + ". City: " + forecastDataArray.city.name + ", Date/Time: " + AEDT + " AEDT , Temp: " + forecastDataArray.list[i].main.temp + ", Min: " + forecastDataArray.list[i].main.temp_min + ", Max: " + forecastDataArray.list[i].main.temp_max;  //build the forecst
    console.log(forecastText);
        
    
    //Build and append containers
    
    var forecastEl = document.createElement('div');                                       // Declare var forecastEl - create new 'div' element
        forecastEl.classList = 'list-item flex-row justify-space-between align-center';   // Add classes to new 'div' element

    var titleEl = document.createElement('span');                                         // Declare var title El - create new 'span' element
        titleEl.textContent = forecastText;                                                // Add weatherForcast text to the new span element
        forecastEl.appendChild(titleEl);                                                  // Append titleEl (child) to forecastEl (parent)

    var statusEl = document.createElement('span');                                        // Declare Var statusEl  - create new 'span' element
        statusEl.classList = 'flex-row align-center';                                     // Add classes to span element
        statusEl.textContent = "**" + [i];
        forecastEl.appendChild(statusEl);                                                 // Append statusEl (child) to forecastEl (parent)   
    
    forecastContainerEl.appendChild(forecastEl);                                           // Append forecastEl (parent) to forecastContainerEl (parent)
  }
};

//-----------------------------------------------//
//- Listener to capture click to "Get Forecast" -//
//-----------------------------------------------//

searchFormEl.addEventListener('submit', function(event) {
  console.log("\n\n\n ! userFormEl Clicked");    
  checkSearchEmpty(event);
});


// //----------------------------------------------------//
// //- Listener to capture click to "Previous Searches" -//
// //----------------------------------------------------//

// languageButtonsEl.addEventListener('click', function(event) {
//   console.log("\n\n\n ! languageButtonsEl Clicked");  
//   buttonClickHandler(event);
// });
