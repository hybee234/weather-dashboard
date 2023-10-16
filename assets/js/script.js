const searchFormEl = document.querySelector('#search-form'); 
const languageButtonsEl = document.querySelector('#language-buttons'); //buttons to select JS, HTML, CSS
const searchInputEl = document.querySelector('#search-field');
const forecastContainerEl = document.querySelector('#forecast-container');
const locationSpanEl = document.querySelector('#location-display'); // name that comes after "weather forecaast for:"
const modalEl =  document.getElementById('modal');                                    // Modal Window
const modalTitleEl = document.getElementById('modal-title');                         // Modal Title Text
const modalLineOneEl = document.getElementById('modal-line-one');                    // Modal Pragraph line one
const modalLineTwoEl = document.getElementById('modal-line-two');                    // Modal Pragraph line two
const modalOKBtn = document.getElementById('modal-ok')                               // Modal OK button
const modalCloseBtn = document.getElementById('modal-close')                         // Modal Close button (cross)
const previousSearchContainerEl = document.getElementById('prev-search-cont')                    // Container for previous search
const previousSearchButtonContainerEl = document.getElementById('prev-search-button-container')  //Container for previous search buttons
const clearHistoryBtn = document.getElementById('clear-history')                        //Container for previous search buttons

const apiKey = "ebe9a8cb2cc6f41abc680b652e9804b6";
var lat = "-37.81373321550253";                   // latitude to be populated by co-ordinate API (Default is Melbourne)
var lon = "144.96284987796403";                   // longitude to be populated by co-ordinate API (Default is Melbourne)
var searchCity = "";                                   // search term used
var coordDataArray = [];                          // Object to store coordinate API data returned
var forecastDataArray = [];                       // Object to store forecast API data returned
var nameAPI = "";                                  // to store city name from Geolocation API
var stateAPI = "";                                 // to store state name from Geolocation API
var countryAPI = "";                               // to store Country code value from Geolocation API
var previousSearchArray = [];                     // Array to store historical searches (and interact with local storage)

//----------------------------------//
//- Function - Assess Search Value -//
//----------------------------------//

var assessSearchValue = event =>  {
    console.log("\n\n\n > assessSearchValue() Called");   
    event.preventDefault();
    searchCity = searchInputEl.value.trim().toLowerCase();         // Set value of global var "search" = value in search field (trimmed and lowercase)
    //console.log("  search captured is: " + search);  
    if (searchCity !=="") {                                       //if search is not blank then execute code block
        console.log("  Submitted searchCity ('" + searchCity + "')"); 
        forecastContainerEl.textContent = '';                   //clear forecast container (list of forecast)
        searchInputEl.value = '';                               //clear search field        
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

// ---------------------------------------------//
// - Function - Fetch co-ordinates by location -//
// ---------------------------------------------//
var fetchCoordinates = () => {
    console.log ("\n\n\n > fetchCoordinates() called");
    var apiCoordinates = "http://api.openweathermap.org/geo/1.0/direct?q=" + searchCity + "&limit=5&appid=" + apiKey;     // to get longitude/latitude info
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

//---------------------------------------------//
//- Function - Fetch Forecast by co-ordinates -//
//---------------------------------------------//

var fetchForecast = () => {
    console.log("\n\n\n > fetchForecast() Called")    
    console.log("Latitude = " + lat)
    console.log("Longitude = " + lon)
    
    var apiForecast = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=80&appid=${apiKey}`;

    console.log("  fetching forecast from API..");  
    fetch(apiForecast).then(function (response) {      
        if (response.ok) {
            console.log("  ... fetchForecast API Response received");            
            response.json().then(function (forecastData) {  //store API reponse temporary in "forecastData"
              
                if ( forecastData.length === 0 ) {
                    console.log("  No weather forecast data found - presenting modal alert") //if no weather location is available then start again
                    modalEl.style.display = "inline";
                    modalTitleEl.textContent = "No weather forecast available";
                    modalLineOneEl.textContent = "The server does not have forecast data for the city of interest";
                    modalLineTwoEl.textContent = "Please try another city";
                    return;
                } else {                // Good to go                        
                    forecastDataArray = forecastData; //store forecastData from API into local object "forecastDataArray"
                    console.log(" Forecast API data stored in global variable 'forecastDataArray'");
                    console.log(forecastDataArray);     
                    // forcastDataArray analysis step needed
                        // map to dates?
                        // filter for highest value?
                        // filter for lowest value?       
                    submitStorage(); 
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

//--------------------------------------------------------//
//- Function - Submit Search into Local Storage Forecast -//
//--------------------------------------------------------//
var submitStorage = () => {
    console.log("\n\n\n > submitStorage() Called")
    console.log(`  Assessing if ${searchCity} already exists in previousSearchArray` )
    
    var testDuplicate = previousSearchArray.indexOf(searchCity);  // IndexOf returns index value of when 'searchCity' first appears in 'previousSearchArray'
    if (testDuplicate === parseInt(-1)) {        // -1 means doesn't exist in array
        previousSearchArray.push(searchCity);    // Append last successful search to array
        console.log("  New search term, adding to local storage")
        console.log(previousSearchArray);
        localStorage.setItem('locationforecast', JSON.stringify(previousSearchArray));                             // Store successful searches into Local storage (store "search" into Key "locationforecast")
        renderHistoryButtons();
    } else {
        console.log("  " + searchCity + " already appears in previous searches - not adding to local storage")    
}
    displayForecast(); 
    return;
};

//---------------------------------------------------------------------//
//- Function - Retrieve previous searches from Local Storage Forecast -//
//---------------------------------------------------------------------//
var retrieveStorage = () => {
    let previousSearch = localStorage.getItem('locationforecast');                                   // retrieve data from local storage ('key = recipes') - store as savedRecipes    
    console.log("  PreviousSearch Array: " + previousSearch)           
        if (previousSearch) {                                                                     // If savedRecipes is not null or undefined, then
            previousSearchArray = JSON.parse(previousSearch);                                             // convert to JSON object and store as recipeArray
            console.log("  Previous locations retrieved from local storage (key = 'locationforecast'):");
            console.log("    previousSearchArray:\n    ------------");
            console.log(previousSearchArray);
            renderHistoryButtons();                                                                   // Run displayRecipes() to display them 
            return;
        } else {                                                                                // else if savedRecipes is null or undefined (i.e. no local storage)
            console.log("  locationforecast null or undefined");    
            renderHistoryButtons();      
        return;
        };                                                     
};

//-------------------------------//
//- Function - Display Forecast -//
//-------------------------------//
var displayForecast = () => {
    console.log("\n\n\n > displayForecast() Called");  
    console.log("  search term used = '" + searchCity + "'"); 
    
    locationSpanEl.textContent = nameAPI + ", " + stateAPI + ", " + countryAPI + "   |   Lat/Lon:   " + lat + ", " + lon;
      
    console.log("  coordDataArray[0] values\n  ------------------------\n  Lat: " + coordDataArray[0].lat + "\n  Lon: " + coordDataArray[0].lon + "\n  Country: " + countryAPI + "\n  Name: " + nameAPI + "\n  State: " + stateAPI);
  
    for (let i = 0; i < forecastDataArray.list.length; i = i+1) {    //increment by 8 to retrieve the value from the same time each day (API provides 3 hourly forecasts)
        
        var AEDT = dayjs.unix(forecastDataArray.list[i].dt).format('ddd, D/M/YYYY, HH:mm:ss A');   // Declare var AEDT store date/time convert from Unix to AEDT
               
        
        var forecastCity = "City: " + forecastDataArray.city.name;
        var forecastDate = "Date/Time: " + AEDT + " AEDT";
        var forecastTemp = "Temp: " + forecastDataArray.list[i].main.temp + "\xB0 C";
        var forecastMinTemp = "Min: " + forecastDataArray.list[i].main.temp_min + "\xB0 C";
        var forecastMaxTemp = "Max: " + forecastDataArray.list[i].main.temp_max + "\xB0 C";
        var forecastWind = "Wind: " + forecastDataArray.list[i].wind.speed + " km/hr";
        var forecastHummidity = "Humidity: " + forecastDataArray.list[i].main.humidity + "%";
        var forecastIcon = "http://openweathermap.org/img/w/" + forecastDataArray.list[i].weather[0].icon + ".png"
        
        let forecastText = i+": " + forecastCity + ", " + forecastDate + ", " + forecastTemp + ", " + forecastMinTemp + ", " + forecastMaxTemp + ", " + forecastWind + ", " + forecastHummidity + ", " + forecastIcon;
        //console.log(forecastText);

        var forecastCardEl = document.createElement('li');                                                                                             // Create recipe container (li) - this will be appended to main 'ul" container (resutlsTableEl)
        forecastCardEl.classList.add ("forecast-container", "border-2", "rounded-xl", "flex", "flex-wrap", "p-1", "m-1", "border-emerald-400", "bg-white", "dark:bg-slate-900", "w-96");                // Add class (tailwind style)
        forecastCardEl.classList.add ("transition", "duration", "300", "ease-in-out")
        forecastCardEl.textContent = i
        forecastContainerEl.appendChild(forecastCardEl);                                                                                                    // Append recipeContinerEl to resultsTableEl

            var forecastDateEl = document.createElement('div')
            forecastDateEl.classList.add("bg-emerald-300", "w-full")                                                                       
            forecastDateEl.textContent = forecastDate 
            forecastCardEl.appendChild(forecastDateEl);                                                                                          

            var forecastIconEl = document.createElement('div')
            forecastIconEl.classList.add("bg-blue-300", "w-full", "flex", "justify-center", "text-center")
            forecastCardEl.appendChild(forecastIconEl);                                                                                          

                var forecastIconLink = document.createElement('img')
                forecastIconLink.classList.add("bg-blue-300", "object-none")                                                                       
                forecastIconLink.src = forecastIcon;                
                forecastIconEl.appendChild(forecastIconLink);     

            var forecastTempEl = document.createElement('div')
            forecastTempEl.classList.add("bg-yellow-300", "w-full")                                                                       
            forecastTempEl.textContent = `${forecastTemp}`
            forecastCardEl.appendChild(forecastTempEl);    

                var forecastTempHighLowEl = document.createElement('div')
                forecastTempHighLowEl.classList.add("bg-orange-300", "w-full")                                                                       
                forecastTempHighLowEl.textContent = `Low: ${forecastMinTemp} / High: ${forecastMaxTemp}`
                forecastTempEl.appendChild(forecastTempHighLowEl);    

            var forecastWindEl = document.createElement('div')
            forecastWindEl.classList.add("bg-violet-300", "w-full")                                                                       
            forecastWindEl.textContent = forecastWind;
            forecastCardEl.appendChild(forecastWindEl);    

            var forecastHumidityEl = document.createElement('div')
            forecastHumidityEl.classList.add("bg-purple-300", "w-full")                                                                       
            forecastHumidityEl.textContent = forecastHummidity;
            forecastCardEl.appendChild(forecastHumidityEl);        
    };
    renderHistoryButtons();         //Update and show the history buttons    
    return;
};



//-------------------------------------//
//- Function - Render history buttons -//
//-------------------------------------//

//To be called by page load and after display forecast

var renderHistoryButtons = () => {
    console.log("\n\n\n > renderHistoryButton() Called");  
    console.log (previousSearchArray)
    previousSearchButtonContainerEl.innerHTML = ""    
    previousSearchContainerEl.style.visibility = "block"     
    for (let i=0; i < previousSearchArray.length; i++)
     {
        
        var previousSearchButton = document.createElement('button');
        previousSearchButton.classList.add("w-4/5", "my-1", "p-2", "rounded-md", "shadow-md", "shadow-black", "bg-blue-300", "hover:shadow-lg", "hover:shadow-black", "hover:bg-blue-400", "ease-out", "hover:ease-in", "text-center");               
        previousSearchButton.setAttribute('data-index',previousSearchArray[i])
        let previousSearch = previousSearchArray[i];
        let previousSearchCapital = previousSearch.charAt(0).toUpperCase() + previousSearch.slice(1);  //Capitalise first letter
        previousSearchButton.textContent = previousSearchCapital
        previousSearchButtonContainerEl.appendChild(previousSearchButton);           
    };
    if (previousSearchArray.length > 0) {        
        console.log("  Showing Clear History Button");
        clearHistoryBtn.hidden = false;      // show the "clear history" button
    } else {        
        console.log("  Hiding Clear History Button");
        clearHistoryBtn.hidden = true;       // hide the "clear history" button
    }
    return;
};

//----------------------------------//
//- Listener - Clear local storage -//
//----------------------------------//
clearHistoryBtn.addEventListener("click", function(event) {   
    console.log("\n\n\n ! clearHistoryBtn clicked");  
    console.log(previousSearchArray);
    localStorage.removeItem('locationforecast');                             // Store successful searches into Local storage (store "search" into Key "locationforecast")
    previousSearchArray = [];
    console.log("  History cleared")
    renderHistoryButtons();
});

//------------------------------------------//
//- Listener to search from history button -//
//------------------------------------------//
previousSearchButtonContainerEl.addEventListener("click", function(event) {        
    console.log("\n\n\n ! previousSearchButtonContainerEl clicked");  
    let element = event.target;                   // declare var element = element that was clicked by user
    if (element.matches("button") === true) { 

       console.log("  ! Button element clicked");
       var previousSearch = element.getAttribute("data-index");
       console.log(previousSearch);
       searchCity = previousSearch
       fetchCoordinates();
    } 
    return;  
 });



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

window.addEventListener('load', function () {                                               // Event listener that triggers on page load
    console.log("\n\n\n! Page load triggered");
    retrieveStorage();
});      
  

