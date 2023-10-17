const searchFormEl = document.getElementById('search-form'); 
const languageButtonsEl = document.getElementById('language-buttons'); //buttons to select JS, HTML, CSS
const searchInputEl = document.getElementById('search-field');

const currentWeatherTitleEl = document.getElementById('current-weather-title');         // Subtitle - heading for firecast one
//const locationSpanEl = document.getElementById('location-display');                 // name that comes after "weather forecaast for:"
const currentEl = document.getElementById('current-weather')
const forecastContainerEl = document.getElementById('forecast-container');  // Forecast cards beyond first one dynamically appending to this


const modalEl =  document.getElementById('modal');                                    // Modal Window
const modalTitleEl = document.getElementById('modal-title');                         // Modal Title Text
const modalLineOneEl = document.getElementById('modal-line-one');                    // Modal Pragraph line one
const modalLineTwoEl = document.getElementById('modal-line-two');                    // Modal Pragraph line two
const modalOKBtn = document.getElementById('modal-ok');                               // Modal OK button
const modalCloseBtn = document.getElementById('modal-close');                         // Modal Close button (cross)
const previousSearchContainerEl = document.getElementById('prev-search-cont');                    // Container for previous search
const previousSearchButtonContainerEl = document.getElementById('prev-search-button-container');  //Container for previous search buttons
const clearHistoryBtn = document.getElementById('clear-history');                        //Container for previous search buttons
const footerTextEl = document.getElementById('footer-text');                            // Text at the bottom of footer


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
var AEDT = ""                                     // Forecast date converted to AEDT
var subsetArray = [];                             // Subset of data from forecastDataArray
var uniqueDateArray = [];                           // subSetArray manipulated to group readings from the same date together - allowing for sorting to determine max/min value
var arrayForRendering = {"index": [{}]};       // data manipulated in manipulateDate() function is used to construct this array for final rendering

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
    
    var apiCoordinates = "https://api.openweathermap.org/geo/1.0/direct?q=" + searchCity + "&limit=5&appid=" + apiKey;     // to get longitude/latitude info
    console.log("  fetching coordinates from OpenWeather Geocoding API ...");
    console.log(apiCoordinates);

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
        
    var apiForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=80&appid=${apiKey}&exclude=minutely,hourly,alert`;
    console.log(apiForecast);

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
        localStorage.setItem('locationforecast', JSON.stringify(previousSearchArray));  // Store successful searches into Local storage (store "search" into Key "locationforecast")
        renderHistoryButtons();
    } else {
        console.log("  " + searchCity + " already appears in previous searches - not adding to local storage")    
}
    manipulateData(); 
    return;
};

//---------------------------------------------------------------------//
//- Function - Retrieve previous searches from Local Storage Forecast -//
//---------------------------------------------------------------------//
var retrieveStorage = () => {
    console.log("\n\n\n > retrieveStorage() Called")
    let previousSearch = localStorage.getItem('locationforecast');                                   // retrieve data from local storage ('key = recipes') - store as savedRecipes    
    console.log("  PreviousSearch Array: " + previousSearch)           
        if (previousSearch) {                                                                     // If savedRecipes is not null or undefined, then
            previousSearchArray = JSON.parse(previousSearch);                                             // convert to JSON object and store as recipeArray
            console.log("  Retrieved (key = 'locationforecast'):");
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

//------------------------------//
//- Function - Manipulate data -//
//------------------------------//

// OpenweatherAPI provides 3 hourly forecasts up to 5 days ahead of time
// Selecting the best values to display on each day of the forecast is challenging,
// (requirements do not specify and weather forecast websites generally don't provide that level of detail)
// The below specifications have been arbitarily determined.
// The Data manipulation in this function is aimed to:
    // Group forecasts into days
    // Determing the maximum Temperature for the day
    // Determine minimum Temperature for the day
    // Determine maximum humidity for the day
    // Determine maximum wind for the day
    // Obtain the icon relating to the maximum Temperature

var manipulateData = () => {
    console.log("\n\n\n > manipulateData() Called")    

        //---------------//
        //- subsetArray -//
        //---------------//

// subSetArray is a subset of forecastDataArray (forecastDataArray contains the full response from the weatherforecast API response)
// the purpose of subSetArray is to pull data points of interest (data that will be used on the weather dashboard with some manipulation (i.e. date and icon))
// the data in subSetArray will be further manipulated to eventually produce the forecast

    subsetArray = []; // clear subsetArray

    // populate subsetArray with data from forecastDataArray - transforming date and icon 
    for (let i=0; i< forecastDataArray.list.length; i = i+1) {
        subsetArray.push(
            {
            "date": ((dayjs.unix(forecastDataArray.list[i].dt).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond',0)).format('D/M/YYYY')),            
            "tempMin": forecastDataArray.list[i].main.temp_min,
            "tempMax": forecastDataArray.list[i].main.temp_max,
            "wind": forecastDataArray.list[i].wind.speed,
            "humidity": forecastDataArray.list[i].main.humidity,
            "temp": forecastDataArray.list[i].main.temp,
            "icon": "http://openweathermap.org/img/w/" + forecastDataArray.list[i].weather[0].icon + ".png"
            }
        )
    };

    console.log("  subsetArray:\n  ------------");
    console.log(subsetArray);

        //-------------------//
        //- uniqueDateArray -//
        //-------------------//

// uniqueDateArray is populated by data from subsetArray
// the purpose of uniqueDateArray is to store the data from subsetArray grouped by Date ("zero'd" or rounded down to 0000hrs)
// data organised this way allows the use of sort methods to determine maximum and minimum values within a day
    
    uniqueDateArray = { //clear uniqueDateArray 
        "date": [],
        "day0": [],
        "day1": [],
        "day2": [],
        "day3": [],
        "day4": [],
        "day5": []
    }; 

    //poulate uniqueDateArray.date with unique date values that appear in subsetArray
    for (let j = 0; j < subsetArray.length;j++) {
        let assessDate = uniqueDateArray.date.indexOf(subsetArray[j].date)
        if (assessDate === parseInt(-1)) {
            uniqueDateArray.date.push(subsetArray[j].date)
            // console.log("  New unique date, adding to uniqueDateArray")
            // console.log(uniqueDateArray);        
        } else {
            // console.log("  " + subsetArray[j].date + " already appears in uniqueDate - not adding")
            }
    };
    
    // Assess all date values in subSetArray and push them into corresponding arrays in uniqueDateArray (series of nested if statements)
    
    for (let k = 0; k < subsetArray.length; k = k+1) {

        if (subsetArray[k].date === uniqueDateArray.date[0]) {  
            uniqueDateArray.day0.push(subsetArray[k])
            // console.log("push 0")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[1]) {
            uniqueDateArray.day1.push(subsetArray[k])
            // console.log("push 1")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[2]) {
            uniqueDateArray.day2.push(subsetArray[k])
            // console.log("push 2")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[3]) {
            uniqueDateArray.day3.push(subsetArray[k])
            // console.log("push 3")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[4]) {
            uniqueDateArray.day4.push(subsetArray[k])
            // console.log("push 4")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[5]) {
            uniqueDateArray.day5.push(subsetArray[k])
            // console.log("push 5")
        } else {
            // console.log("not pushing")
        };
    };
    console.log ("  uniqueDateArray: \n  ----------------")   
    console.log(uniqueDateArray)
    
    // With uniqueDateArray constructed, the values required for forecasting can be determined with a series of sorting to determine maximum and minmum values
    // All variables used across Day 0 to Day 5 will be used to construct a final javascript object "arrayForRendering" with data structure designed to support a "for loop" to dynamically add elements to the HTML
    // Note: Day 5 data is not always available for the API - an if statement is in place to manage any errors

    //---------//
    //- Day 0 -//
    //---------//
    
    //Max Temp//
    uniqueDateArray.day0.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order)
    var dayZeroMaxTemp = `High: ${uniqueDateArray.day0[0].tempMax}\xB0C`;      
    console.log(`  Day ZERO Max Temp = ${dayZeroMaxTemp}`); 
    
    //Icon//
    uniqueDateArray.day0.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order) - Icon based off highest Temperature
    var dayZeroIcon = uniqueDateArray.day0[0].icon;
    console.log(`  Day ZERO Icon ${dayZeroIcon}`);

    //Min Temp//  
    uniqueDateArray.day0.sort((a,b) => (a.tempMin > b.tempMin) ? 1 : (a.tempMin < b.tempMin) ?-1 : 0 );   // Lowest value in index[0] (ascending order)
    var dayZeroMinTemp = `Low: ${uniqueDateArray.day0[0].tempMin}\xB0C`;
    console.log(`  Day ZERO Min Temp = ${dayZeroMinTemp}`);    

    //Max Wind//
    uniqueDateArray.day0.sort((a,b) => (a.wind < b.wind) ? 1 : (a.wind > b.wind) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayZeroMaxWind = `Wind: ${uniqueDateArray.day0[0].wind} km/hr`;
    console.log(`  Day ZERO Max Wind = ${dayZeroMaxWind}`); 

    //Max Humidity//
    uniqueDateArray.day0.sort((a,b) => (a.humidity < b.humidity) ? 1 : (a.humidity > b.humidity) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayZeroMaxHumidity = `Humidity: ${uniqueDateArray.day0[0].humidity}%`;
    console.log(`  Day ZERO Max Humidity = ${dayZeroMaxHumidity}`); 

    //---------//
    //- Day 1 -//
    //---------//
    
    //Max Temp//
    uniqueDateArray.day1.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order)
    var dayOneMaxTemp = `High: ${uniqueDateArray.day1[0].tempMax}\xB0C`;      
    console.log(`\n  Day ONE Max Temp = ${dayOneMaxTemp}`); 
    
    //Icon//
    uniqueDateArray.day1.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order) - Icon based off highest Temperature
    var dayOneIcon = uniqueDateArray.day1[0].icon;
    console.log(`  Day ONE Icon ${dayOneIcon}`);

    //Min Temp//  
    uniqueDateArray.day1.sort((a,b) => (a.tempMin > b.tempMin) ? 1 : (a.tempMin < b.tempMin) ?-1 : 0 );   // Lowest value in index[0] (ascending order)
    var dayOneMinTemp = `Low: ${uniqueDateArray.day1[0].tempMin}\xB0C`;
    console.log(`  Day ONE Min Temp = ${dayOneMinTemp}`);    

    //Max Wind//
    uniqueDateArray.day1.sort((a,b) => (a.wind < b.wind) ? 1 : (a.wind > b.wind) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayOneMaxWind = `Wind: ${uniqueDateArray.day1[0].wind} km/hr`;
    console.log(`  Day ONE Max Wind = ${dayOneMaxWind}`); 

    //Max Humidity//
    uniqueDateArray.day1.sort((a,b) => (a.humidity < b.humidity) ? 1 : (a.humidity > b.humidity) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayOneMaxHumidity = `Humidity: ${uniqueDateArray.day1[0].humidity}%`;
    console.log(`  Day ONE Max Humidity = ${dayOneMaxHumidity}`); 

    //---------//
    //- Day 2 -//
    //---------//
    
    //Max Temp//
    uniqueDateArray.day2.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order)
    var dayTwoMaxTemp = `High: ${uniqueDateArray.day2[0].tempMax}\xB0C`;      
    console.log(`  Day TWO Max Temp = ${dayTwoMaxTemp}`); 
    
    //Icon//
    uniqueDateArray.day2.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order) - Icon based off highest Temperature
    var dayTwoIcon = uniqueDateArray.day2[0].icon;
    console.log(`  Day TWO Icon ${dayTwoIcon}`);

    //Min Temp//  
    uniqueDateArray.day2.sort((a,b) => (a.tempMin > b.tempMin) ? 1 : (a.tempMin < b.tempMin) ?-1 : 0 );   // Lowest value in index[0] (ascending order)
    var dayTwoMinTemp = `Low: ${uniqueDateArray.day2[0].tempMin}\xB0C`;
    console.log(`  Day TWO Min Temp = ${dayTwoMinTemp}`);    

    //Max Wind//
    uniqueDateArray.day2.sort((a,b) => (a.wind < b.wind) ? 1 : (a.wind > b.wind) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayTwoMaxWind = `Wind: ${uniqueDateArray.day2[0].wind} km/hr`;
    console.log(`  Day TWO Max Wind = ${dayTwoMaxWind}`); 

    //Max Humidity//
    uniqueDateArray.day2.sort((a,b) => (a.humidity < b.humidity) ? 1 : (a.humidity > b.humidity) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayTwoMaxHumidity = `Humidity: ${uniqueDateArray.day2[0].humidity}%`;
    console.log(`  Day TWO Max Humidity = ${dayTwoMaxHumidity}`); 


    //---------//
    //- Day 3 -//
    //---------//
    
    //Max Temp//
    uniqueDateArray.day3.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order)
    var dayThreeMaxTemp = `High: ${uniqueDateArray.day3[0].tempMax}\xB0C`;      
    console.log(`\n  Day THREE Max Temp = ${dayThreeMaxTemp}`); 
    
    //Icon//
    uniqueDateArray.day3.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order) - Icon based off highest Temperature
    var dayThreeIcon = uniqueDateArray.day3[0].icon;
    console.log(`  Day THREE Icon ${dayThreeIcon}`);

    //Min Temp//  
    uniqueDateArray.day3.sort((a,b) => (a.tempMin > b.tempMin) ? 1 : (a.tempMin < b.tempMin) ?-1 : 0 );   // Lowest value in index[0] (ascending order)
    var dayThreeMinTemp = `Low: ${uniqueDateArray.day3[0].tempMin}\xB0C`;
    console.log(`  Day THREE Min Temp = ${dayThreeMinTemp}`);    

    //Max Wind//
    uniqueDateArray.day3.sort((a,b) => (a.wind < b.wind) ? 1 : (a.wind > b.wind) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayThreeMaxWind = `Wind: ${uniqueDateArray.day3[0].wind} km/hr`;
    console.log(`  Day THREE Max Wind = ${dayThreeMaxWind}`); 

    //Max Humidity//
    uniqueDateArray.day3.sort((a,b) => (a.humidity < b.humidity) ? 1 : (a.humidity > b.humidity) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayThreeMaxHumidity = `Humidity: ${uniqueDateArray.day3[0].humidity}%`;
    console.log(`  Day THREE Max Humidity = ${dayThreeMaxHumidity}`); 

    //---------//
    //- Day 4 -//
    //---------//
    
    //Max Temp//
    uniqueDateArray.day4.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order)
    var dayFourMaxTemp = `High: ${uniqueDateArray.day4[0].tempMax}\xB0C`;      
    console.log(`\n  Day FOUR Max Temp = ${dayFourMaxTemp}`); 
    
    //Icon//
    uniqueDateArray.day4.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order) - Icon based off highest Temperature
    var dayFourIcon = uniqueDateArray.day4[0].icon;
    console.log(`  Day FOUR Icon ${dayFourIcon}`);

    //Min Temp//  
    uniqueDateArray.day4.sort((a,b) => (a.tempMin > b.tempMin) ? 1 : (a.tempMin < b.tempMin) ?-1 : 0 );   // Lowest value in index[0] (ascending order)
    var dayFourMinTemp = `Low: ${uniqueDateArray.day4[0].tempMin}\xB0C`;
    console.log(`  Day FOUR Min Temp = ${dayFourMinTemp}`);    

    //Max Wind//
    uniqueDateArray.day4.sort((a,b) => (a.wind < b.wind) ? 1 : (a.wind > b.wind) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayFourMaxWind = `Wind: ${uniqueDateArray.day4[0].wind} km/hr`;
    console.log(`  Day FOUR Max Wind = ${dayFourMaxWind}`); 

    //Max Humidity//
    uniqueDateArray.day4.sort((a,b) => (a.humidity < b.humidity) ? 1 : (a.humidity > b.humidity) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayFourMaxHumidity = `Humidity: ${uniqueDateArray.day4[0].humidity}%`;
    console.log(`  Day FOUR Max Humidity = ${dayFourMaxHumidity}`); 

    //---------//
    //- Day 5 -//
    //---------//
      
    if (uniqueDateArray.length >= 6) {
    //Max Temp//
    uniqueDateArray.day5.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order)
    var dayFiveMaxTemp = `High: ${uniqueDateArray.day5[0].tempMax}\xB0C`;      
    console.log(`\n  Day FOU5 Max Temp = ${dayFiveMaxTemp}`); 
    
    //Icon//
    uniqueDateArray.day5.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Highest value in index[0] (descending order) - Icon based off highest Temperature
    var dayFiveIcon = uniqueDateArray.day5[0].icon;
    console.log(`  Day FIVE Icon ${dayFiveIcon}`);

    //Min Temp//  
    uniqueDateArray.day5.sort((a,b) => (a.tempMin > b.tempMin) ? 1 : (a.tempMin < b.tempMin) ?-1 : 0 );   // Lowest value in index[0] (ascending order)
    var dayFiveMinTemp = `Low: ${uniqueDateArray.day5[0].tempMin}\xB0C`;
    console.log(`  Day FIVE Min Temp = ${dayFiveMinTemp}`);    

    //Max Wind//
    uniqueDateArray.day5.sort((a,b) => (a.wind < b.wind) ? 1 : (a.wind > b.wind) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayFiveMaxWind = `Wind: ${uniqueDateArray.day5[0].wind} km/hr`;
    console.log(`  Day FIVE Max Wind = ${dayFiveMaxWind}`); 

    //Max Humidity//
    uniqueDateArray.day5.sort((a,b) => (a.humidity < b.humidity) ? 1 : (a.humidity > b.humidity) ?-1 :0 );   // Highest value in index[0] (descending order)
    var dayFiveMaxHumidity = `Humidity: ${uniqueDateArray.day5[0].humidity}%`;
    console.log(`  Day FIVE Max Humidity = ${dayFiveMaxHumidity}`); 
    
    } else {
    console.log(`\n  uniqueDataArray.date.length <6, No data to render day 5`)
};

        //-------------------//
        //- uniqueDateArray -//
        //-------------------//

// uniqueDateArray is populated by data from subsetArray
// the purpose of uniqueDateArray is to store the data from subsetArray grouped by Date ("zero'd" or rounded down to 0000hrs)
// data organised this way allows the use of sort methods to determine maximum and minimum values within a day

arrayForRendering =      
        {"index": [
            {"date": ""},
            {"date": ""},
            {"date": ""},
            {"date": ""},
            {"date": ""},
            {"date": ""}     
        ]};

//Build array - Day 0
    arrayForRendering.index[0].date = uniqueDateArray.date[0];
    arrayForRendering.index[0].iconURL = dayZeroIcon;
    arrayForRendering.index[0].maxTemp = dayZeroMaxTemp;
    arrayForRendering.index[0].minTemp = dayZeroMinTemp;
    arrayForRendering.index[0].maxHumidity = dayZeroMaxHumidity;
    arrayForRendering.index[0].maxWind = dayZeroMaxWind;

//Build array - Day 1
    arrayForRendering.index[1].date = uniqueDateArray.date[1];
    arrayForRendering.index[1].iconURL = dayOneIcon;
    arrayForRendering.index[1].maxTemp = dayOneMaxTemp;
    arrayForRendering.index[1].minTemp = dayOneMinTemp;
    arrayForRendering.index[1].maxHumidity = dayOneMaxHumidity;
    arrayForRendering.index[1].maxWind = dayOneMaxWind;

//Build array - Day 2
    arrayForRendering.index[2].date = uniqueDateArray.date[2];
    arrayForRendering.index[2].iconURL = dayTwoIcon;
    arrayForRendering.index[2].maxTemp = dayTwoMaxTemp;
    arrayForRendering.index[2].minTemp = dayTwoMinTemp;
    arrayForRendering.index[2].maxHumidity = dayTwoMaxHumidity;
    arrayForRendering.index[2].maxWind = dayTwoMaxWind;

//Build array - Day 3
    arrayForRendering.index[3].date = uniqueDateArray.date[3];
    arrayForRendering.index[3].iconURL = dayThreeIcon;
    arrayForRendering.index[3].maxTemp = dayThreeMaxTemp;
    arrayForRendering.index[3].minTemp = dayThreeMinTemp;
    arrayForRendering.index[3].maxHumidity = dayThreeMaxHumidity;
    arrayForRendering.index[3].maxWind = dayThreeMaxWind;

//Build array - Day 4
    arrayForRendering.index[4].date = uniqueDateArray.date[4];
    arrayForRendering.index[4].iconURL = dayFourIcon;
    arrayForRendering.index[4].maxTemp = dayFourMaxTemp;
    arrayForRendering.index[4].minTemp = dayFourMinTemp;
    arrayForRendering.index[4].maxHumidity = dayFourMaxHumidity;
    arrayForRendering.index[4].maxWind = dayFourMaxWind;

//Build array - Day 5
if (uniqueDateArray.length >= 6) {
    arrayForRendering.index[5].date = uniqueDateArray.date[5];
    arrayForRendering.index[5].iconURL = dayFiveIcon;
    arrayForRendering.index[5].maxTemp = dayFiveMaxTemp;
    arrayForRendering.index[5].minTemp = dayFiveMinTemp;
    arrayForRendering.index[5].maxHumidity = dayFiveMaxHumidity;
    arrayForRendering.index[5].maxWind = dayFiveMaxWind;
} else {
    console.log(`  uniqueDataArray.date.length <6, no data to add to arrayForRendering`)
}
    console.log ("  arrayForRendering: \n  ----------------")   
    console.log (arrayForRendering)

    displayForecast(); 
    return;
};




//-------------------------------//
//- Function - Display Forecast -//
//-------------------------------//
var displayForecast = () => {
    console.log("\n\n\n > displayForecast() Called");  
    console.log("  search term used = '" + searchCity + "'"); 
    
    currentEl.innerHTML = ""            // Current weather Container
    forecastContainerEl.innerHTML = ""      // Forecast Container

    footerTextEl.textContent = `Latitude: ${lat}, Longitute ${lon}`;  // Show Latitidue/Longitude in footer 
    console.log("  coordDataArray[0] values\n  ------------------------\n  Lat: " + coordDataArray[0].lat + "\n  Lon: " + coordDataArray[0].lon + "\n  Country: " + countryAPI + "\n  Name: " + nameAPI + "\n  State: " + stateAPI);
  
    //- Render first card -//

    // *** TODO *** FIRST CARD SHOULD BE TAKEN FROM SUBSETARRAY - IT IS CURRENT DATA - GET RID OF FOR LOOP, just assign values directly from forecastDataArray
   
    //AEDT = (dayjs.unix(forecastDataArray.list[0].dt).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond',0)).format('D/M/YYYY')
    AEDT = (dayjs.unix(forecastDataArray.list[0].dt).format('dddd, DD MMMM YYYY, HH:mm:ss A'))

    if (stateAPI) {
        var currentCity = `${nameAPI}, ${stateAPI} (${countryAPI})` 
    } else {
        var currentCity = `${nameAPI} (${countryAPI})` 
    }    
    var currentDateTime = AEDT;
    var currentTemp = forecastDataArray.list[0].main.temp + "\xB0 C";
    var currentMinTemp = "Low: " + forecastDataArray.list[0].main.temp_min + "\xB0 C";
    var currentMaxTemp = "High: " + forecastDataArray.list[0].main.temp_max + "\xB0 C";
    var currentWind = "Wind: " + forecastDataArray.list[0].wind.speed + " km/hr";
    var currentHummidity = "Humidity: " + forecastDataArray.list[0].main.humidity + "%";
    var currentIcon = "http://openweathermap.org/img/w/" + forecastDataArray.list[0].weather[0].icon + ".png"

    currentWeatherTitleEl.textContent = "Current Weather in:"
    
        var currentCardEl = document.createElement('div');
        currentCardEl.classList.add ("flex", "flex-wrap", "justify-center", "shrink", "grow")                                                                                                
        currentEl.appendChild(currentCardEl);                                                                                                 

            var currentCityEl = document.createElement('div')
            currentCityEl.classList.add("bg-blue-100", "font-bold", "text-3xl", "p-1", "text-center", "items-center", "justify-center", "w-full")                                                                       
            currentCityEl.textContent = currentCity;
            currentCardEl.appendChild(currentCityEl);                                                                                          

            var currentDateTimeEl = document.createElement('div')
            currentDateTimeEl.classList.add("bg-blue-100", "font-bold", "text-xl", "p-1", "text-center", "items-center", "justify-center", "w-full")                                                                       
            currentDateTimeEl.textContent = currentDateTime;
            currentCardEl.appendChild(currentDateTimeEl);   

            var currentIconEl = document.createElement('div')
            currentIconEl.classList.add("bg-blue-100", "flex", "justify-center", "text-center", "items-center", "w-4/5", "m-2")
            currentCardEl.appendChild(currentIconEl);                                                                                          

                var currentIconLink = document.createElement('img')
                currentIconLink.classList.add("bg-blue-300", "text-center", "object-fill", "w-24", "items-center")                                                                       
                currentIconLink.src = currentIcon;                
                currentIconEl.appendChild(currentIconLink);     

            var currentTempEl = document.createElement('div')
            currentTempEl.classList.add("forecast-top-rounded", "bg-blue-200", "w-4/5", "text-center", "text-xl", "p-1")
            currentTempEl.textContent = "Temp: " + currentTemp            
            currentCardEl.appendChild(currentTempEl);    
           
            var currentMinMaxTempEl = document.createElement('div')
            currentMinMaxTempEl.classList.add("bg-blue-200", "w-4/5", "text-center", "text-xl")                                                                       
            currentMinMaxTempEl.textContent = `${currentMinTemp} / ${currentMaxTemp}`
            currentCardEl.appendChild(currentMinMaxTempEl);    

            var currentWindEl = document.createElement('div')
            currentWindEl.classList.add("bg-blue-200", "w-4/5", "text-center", "text-xl")                                                                       
            currentWindEl.textContent = currentWind;
            currentCardEl.appendChild(currentWindEl);    

            var currentHummidityEl = document.createElement('div')
            currentHummidityEl.classList.add("forecast-bottom-rounded", "bg-blue-200", "w-4/5", "text-center", "text-xl", "p-1", "mb-2")                                                                       
            currentHummidityEl.textContent = currentHummidity;
            currentCardEl.appendChild(currentHummidityEl);
   

//- Render remaining forecast cards -//

    for (let i = 1; i < forecastDataArray.list.length; i = i+1) {    //increment by 8 to retrieve the value from the same time each day (API provides 3 hourly forecasts)
    
        AEDT = (dayjs.unix(forecastDataArray.list[i].dt).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond',0)).format('D/M/YYYY')

        var forecastCity = "City: " + forecastDataArray.city.name;
        var forecastDate = AEDT;
        var forecastTemp = forecastDataArray.list[i].main.temp + "\xB0 C";
        var forecastMinTemp = "Low: " + forecastDataArray.list[i].main.temp_min + "\xB0 C";
        var forecastMaxTemp = "High: " + forecastDataArray.list[i].main.temp_max + "\xB0 C";
        var forecastWind = "Wind: " + forecastDataArray.list[i].wind.speed + " km/hr";
        var forecastHummidity = "Humidity: " + forecastDataArray.list[i].main.humidity + "%";
        var forecastIcon = "https://openweathermap.org/img/w/" + forecastDataArray.list[i].weather[0].icon + ".png"
     
        var forecastCardEl = document.createElement('div');                                                                                             
        forecastCardEl.classList.add ("forecast-card", "rounded-xl", "flex", "flex-wrap", "bg-blue-100", "border-blue-300", "w-1/4", "justify-center", "border-2", "p-1", "flex-in-css-stylesheet"); 
        forecastContainerEl.appendChild(forecastCardEl);                                                                                                 
        
            var forecastDateEl = document.createElement('div')
            forecastDateEl.classList.add("forecast-top-rounded", "bg-blue-800", "w-full", "font-bold", "text-center", "text-blue-100", "p-2")                                                                       
            forecastDateEl.textContent = forecastDate 
            forecastCardEl.appendChild(forecastDateEl);                                                                                          

            var forecastIconEl = document.createElement('div')
            forecastIconEl.classList.add("bg-blue-800", "w-full", "flex", "justify-center", "text-center", "text-blue-100", "p-2")
            forecastCardEl.appendChild(forecastIconEl);                                                                                          

                var forecastIconLink = document.createElement('img')
                forecastIconLink.classList.add("bg-blue-300", "object-fill")                                                                       
                forecastIconLink.src = forecastIcon;                
                forecastIconEl.appendChild(forecastIconLink);     

            var forecastTempEl = document.createElement('div')
            forecastTempEl.classList.add("bg-blue-800", "w-full", "text-center", "text-blue-100", "p-2")
            forecastTempEl.textContent = "Temp: " + forecastTemp            
            forecastCardEl.appendChild(forecastTempEl);    
           

            var forecastTempHighLowEl = document.createElement('div')
            forecastTempHighLowEl.classList.add("bg-blue-800", "w-full", "text-center", "text-blue-100", "p-2")                                                                       
            forecastTempHighLowEl.textContent = `${forecastMinTemp} / ${forecastMaxTemp}`
            forecastCardEl.appendChild(forecastTempHighLowEl);    

            var forecastWindEl = document.createElement('div')
            forecastWindEl.classList.add("bg-blue-800", "w-full", "text-center", "text-blue-100", "p-2")                                                                       
            forecastWindEl.textContent = forecastWind;
            forecastCardEl.appendChild(forecastWindEl);    

            var forecastHumidityEl = document.createElement('div')
            forecastHumidityEl.classList.add("forecast-bottom-rounded", "bg-blue-800", "w-full", "text-center", "text-blue-100", "p-2")                                                                       
            forecastHumidityEl.textContent = forecastHummidity;
            forecastCardEl.appendChild(forecastHumidityEl);   
            
            var forecastiValueEl = document.createElement('div')
            forecastiValueEl.classList.add("bg-blue-500", "w-full", "text-center", "text-blue-100", "p-1", "mt-2")                                                                       
            forecastiValueEl.textContent = `i = ${i}`;
            forecastCardEl.appendChild(forecastiValueEl);             

    };
    renderHistoryButtons();         // Refresh the history buttons    
    return;
};

//-------------------------------------//
//- Function - Render history buttons -//
//-------------------------------------//

//To be called by page load and after display forecast

var renderHistoryButtons = () => {
    console.log("\n\n\n > renderHistoryButton() Called");  
    console.log (previousSearchArray)
    previousSearchButtonContainerEl.innerHTML = ""                  // Clear History Buttons
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
        clearHistoryBtn.hidden = false;      // Show the "clear history" button
    } else {        
        console.log("  Hiding Clear History Button");
        clearHistoryBtn.hidden = true;       // Hide the "clear history" button
    }
    return;
};

//----------------------------------//
//- Listener - Clear local storage -//
//----------------------------------//
clearHistoryBtn.addEventListener("click", function(event) {   
    console.log("\n\n\n ! clearHistoryBtn clicked");  
    console.log(previousSearchArray);
    localStorage.removeItem('locationforecast');                    // Store successful searches into Local storage (store "search" into Key "locationforecast")
    previousSearchArray = [];
    console.log("  History cleared")
    renderHistoryButtons();
});

//------------------------------------------//
//- Listener to search from history button -//
//------------------------------------------//
previousSearchButtonContainerEl.addEventListener("click", function(event) {        
    console.log("\n\n\n ! previousSearchButtonContainerEl clicked");  
    let element = event.target;                                  // declare var element = element that was clicked by user
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

window.addEventListener('load', function () {                  // Event listener that triggers on page load
    console.log("\n\n\n! Page load triggered");
    retrieveStorage();
});      
  

