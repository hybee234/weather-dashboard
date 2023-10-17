const searchFormEl = document.querySelector('#search-form'); 
const languageButtonsEl = document.querySelector('#language-buttons'); //buttons to select JS, HTML, CSS
const searchInputEl = document.querySelector('#search-field');

const forecastOneEl = document.getElementById('forecast-one')
const forecastContainerEl = document.getElementById('forecast-container');  // Forecast cards beyond first one dynamically appending to this

const locationSpanEl = document.querySelector('#location-display'); // name that comes after "weather forecaast for:"
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
        localStorage.setItem('locationforecast', JSON.stringify(previousSearchArray));                             // Store successful searches into Local storage (store "search" into Key "locationforecast")
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
var manipulateData = () => {
    console.log("\n\n\n > manipulateData() Called")

//  AEDT = (dayjs.unix(forecastDataArray.list[i].dt).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond',0)).format('ddd, D/M/YYYY, HH:mm:ss A') // Declare var AEDT store date/time convert from Unix to AEDT, set hour, min, sec, ms to zero

    // Declare subsetArray (Javascript Object) - subsetArray storing subset of data from forecastDataArray for use of this page (forecastDataArray contains API data)
    var subsetArray = [
        // {"date":"17/10/2023", "temp":"23.4", "tempMin":"11.0", "tempMax":"28.0", "wind":"7", "humidity":"60"},
        // {"date":"18/10/2023", "temp":"25.5", "tempMin":"12.0", "tempMax":"30.0", "wind":"8", "humidity":"65"},
        // {"date":"18/10/2023", "temp":"25.5", "tempMin":"12.0", "tempMax":"30.0", "wind":"8", "humidity":"65"},
    ];
  
    // Populate subsetArray with Data 
    for (let i=0; i< forecastDataArray.list.length; i = i+1) {
        subsetArray.push(
            {
            "date": ((dayjs.unix(forecastDataArray.list[i].dt).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond',0)).format('D/M/YYYY')),
            "temp": forecastDataArray.list[i].main.temp,
            "tempMin": forecastDataArray.list[i].main.temp_min,
            "tempMax": forecastDataArray.list[i].main.temp_max,
            "wind": "Wind: " + forecastDataArray.list[i].wind.speed + " km/hr",
            "humidity": "Humidity: " + forecastDataArray.list[i].main.humidity + "%",
            "icon": "http://openweathermap.org/img/w/" + forecastDataArray.list[i].weather[0].icon + ".png"
            }
        )
    };

    console.log("  subsetArray:\n  ------------");
    console.log(subsetArray);

    console.log ("  forecastDataArray: \n  ------------------")       
    console.log(forecastDataArray)
    
    //generate array of unique dates to carry out further data manipulation //declare and clear uniqueDateArray
    var uniqueDateArray = {
        "date": [],
        "day0": [],
        "day1": [],
        "day2": [],
        "day3": [],
        "day4": [],
        "day5": []
    };  

    for (let j = 0; j < subsetArray.length;j++) {
        let testDate = uniqueDateArray.date.indexOf(subsetArray[j].date)
        if (testDate === parseInt(-1)) {
            uniqueDateArray.date.push(subsetArray[j].date)
            console.log("  New unique date, adding to uniqueDateArray")
            console.log(uniqueDateArray);
        
        } else {
            console.log("  " + subsetArray[j].date + " already appears in uniqueDate - not adding")
            }
    }
    
    //push values into respactive days in uniqueDateArray
    for (let k = 0; k < subsetArray.length; k = k+1) {

        if (subsetArray[k].date === uniqueDateArray.date[0]) {
            uniqueDateArray.day0.push(subsetArray[k])
            console.log("push 0")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[1]) {
            uniqueDateArray.day1.push(subsetArray[k])
            console.log("push 1")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[2]) {
            uniqueDateArray.day2.push(subsetArray[k])
            console.log("push 2")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[3]) {
            uniqueDateArray.day3.push(subsetArray[k])
            console.log("push 3")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[4]) {
            uniqueDateArray.day4.push(subsetArray[k])
            console.log("push 4")
        } else

        if (subsetArray[k].date === uniqueDateArray.date[5]) {
            uniqueDateArray.day5.push(subsetArray[k])
            console.log("push 5")
        } else {
            console.log("not pushing")
        }
    }
    console.log(uniqueDateArray)

    // //Filter for dates matching Day 1
    // let dayOne = subsetArray.filter (subsetArray => subsetArray.date === uniqueDateArray.date[0])
    // console.log(dayOne)

    //Day 0 Max Temp
    let sortDay0Max = uniqueDateArray.day0
    sortDay0Max.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 : 0 );   // Sort in descending (a greater than b if in sequence)
    console.log(sortDay0Max)
    var day0Max = uniqueDateArray.day0[0].tempMax
    console.log("Day 0 Max Temp = " + day0Max)

    //Day 0 Min Temp
    let sortDay0Min = uniqueDateArray.day0
    sortDay0Min.sort((a,b) => (a.tempMax > b.tempMax) ? 1 : (a.tempMax < b.tempMax) ?-1 : 0 );   // Sort in ascenmding (a less than b if in sequence)
    console.log(sortDay0Min)
    var day0Min = uniqueDateArray.day0[0].tempMin
    console.log("Day 0 Min Temp = " + day0Min)

    //Day One Max Temp
    let sortDayOneMax = uniqueDateArray.day1
    sortDayOneMax.sort((a,b) => (a.tempMax < b.tempMax) ? 1 : (a.tempMax > b.tempMax) ?-1 :0 );   // Sort in descending (a greater than b if in sequence)
    console.log(sortDayOneMax)    
    var dayOneMax = uniqueDateArray.day1[0].tempMax
    console.log("Day One Max Temp = " + dayOneMax)

    // //Day One Min Temp
    let sortDayOneMin = uniqueDateArray.day1
    sortDayOneMin.sort((a,b) => (a.tempMax > b.tempMax) ? 1 : (a.tempMax < b.tempMax) ?-1 :0 );   // Sort in ascending (a less than b if in sequence)
    console.log(sortDayOneMin)
    var dayOneMin = uniqueDateArray.day1[0].tempMin
    console.log("Day One Min Temp = " + dayOneMin)

        
    // Openweather array - values of interest
    // Date = forecastDataArray.list[i].dt
    // Temp = forecastDataArray.list[i].main.temp + "\xB0 C";
    // MinTemp = "Min: " + forecastDataArray.list[i].main.temp_min + "\xB0 C";
    // MaxTemp = "High: " + forecastDataArray.list[i].main.temp_max + "\xB0 C";
    // Wind = "Wind: " + forecastDataArray.list[i].wind.speed + " km/hr";
    // Hummidity = "Humidity: " + forecastDataArray.list[i].main.humidity + "%";
    // Icon = "http://openweathermap.org/img/w/" + forecastDataArray.list[i].weather[0].icon + ".png"  
    //day1Array[i].date = "19/10/2023"  // This works to replace values! (store "19/10/2023 in day1Array[i].date")

    displayForecast(); 
    return;
};




//-------------------------------//
//- Function - Display Forecast -//
//-------------------------------//
var displayForecast = () => {
    console.log("\n\n\n > displayForecast() Called");  
    console.log("  search term used = '" + searchCity + "'"); 
    
    forecastOneEl.innerHTML = ""            // ForecastOne Container
    forecastContainerEl.innerHTML = ""      // Forecast Container

    footerTextEl.textContent = `Latitude: ${lat}, Longitute ${lon}`;  // Show Latitidue/Longitude in footer 
    console.log("  coordDataArray[0] values\n  ------------------------\n  Lat: " + coordDataArray[0].lat + "\n  Lon: " + coordDataArray[0].lon + "\n  Country: " + countryAPI + "\n  Name: " + nameAPI + "\n  State: " + stateAPI);
  
    //- Render first card -//
    for (let i=0; i<1 ; i=i+1) {

    AEDT = (dayjs.unix(forecastDataArray.list[i].dt).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond',0)).format('D/M/YYYY')

    var forecastOneCity = nameAPI + ", " + stateAPI + ", " + countryAPI 
    var forecastOneDate = AEDT;
    var forecastOneTemp = forecastDataArray.list[i].main.temp + "\xB0 C";
    var forecastOneMinTemp = "Low: " + forecastDataArray.list[i].main.temp_min + "\xB0 C";
    var forecastOneMaxTemp = "High: " + forecastDataArray.list[i].main.temp_max + "\xB0 C";
    var forecastOneWind = "Wind: " + forecastDataArray.list[i].wind.speed + " km/hr";
    var forecastOneHummidity = "Humidity: " + forecastDataArray.list[i].main.humidity + "%";
    var forecastOneIcon = "http://openweathermap.org/img/w/" + forecastDataArray.list[i].weather[0].icon + ".png"

        var forecastCardOneEl = document.createElement('div');
        forecastCardOneEl.classList.add ("flex", "flex-wrap", "justify-center", "shrink", "grow")                                                                                        
        forecastOneEl.appendChild(forecastCardOneEl);                                                                                                 

            var forecastDateOneEl = document.createElement('div')
            forecastDateOneEl.classList.add("bg-blue-100", "font-bold", "text-left", "text-3xl", "p-2", "text-center", "items-center", "justify-center", "flex", "flex-wrap", "grow", "shrink")                                                                       
            forecastDateOneEl.textContent = forecastOneCity + " (" + forecastOneDate  + ")"
            forecastCardOneEl.appendChild(forecastDateOneEl);                                                                                          

            var forecastIconOneEl = document.createElement('div')
            forecastIconOneEl.classList.add("bg-blue-100", "flex", "justify-center", "text-center", "items-center", "w-4/5")
            forecastDateOneEl.appendChild(forecastIconOneEl);                                                                                          

                var forecastIconOneLink = document.createElement('img')
                forecastIconOneLink.classList.add("bg-blue-300", "text-center", "object-fill", "w-24", "items-center")                                                                       
                forecastIconOneLink.src = forecastOneIcon;                
                forecastIconOneEl.appendChild(forecastIconOneLink);     

            var forecastTempOneEl = document.createElement('div')
            forecastTempOneEl.classList.add("forecast-top-rounded", "bg-blue-200", "w-4/5", "text-center", "text-xl", "p-2")
            forecastTempOneEl.textContent = "Temp: " + forecastOneTemp            
            forecastCardOneEl.appendChild(forecastTempOneEl);    
           
            var forecastTempHighLowOneEl = document.createElement('div')
            forecastTempHighLowOneEl.classList.add("bg-blue-200", "w-4/5", "text-center", "text-xl", "p-2")                                                                       
            forecastTempHighLowOneEl.textContent = `${forecastOneMinTemp} / ${forecastOneMaxTemp}`
            forecastCardOneEl.appendChild(forecastTempHighLowOneEl);    

            var forecastWindOneEl = document.createElement('div')
            forecastWindOneEl.classList.add("bg-blue-200", "w-4/5", "text-center", "text-xl", "p-2")                                                                       
            forecastWindOneEl.textContent = forecastOneWind;
            forecastCardOneEl.appendChild(forecastWindOneEl);    

            var forecastHumidityOneEl = document.createElement('div')
            forecastHumidityOneEl.classList.add("forecast-bottom-rounded", "bg-blue-200", "w-4/5", "text-center", "text-xl", "p-2")                                                                       
            forecastHumidityOneEl.textContent = forecastOneHummidity;
            forecastCardOneEl.appendChild(forecastHumidityOneEl);
            
            var forecastiValueOneEl = document.createElement('div')
            forecastiValueOneEl.classList.add("bg-blue-200", "w-4/5", "text-center", "text-xl", "p-1", "my-2")                                                                       
            forecastiValueOneEl.textContent = `i = ${i}`;
            forecastCardOneEl.appendChild(forecastiValueOneEl);     
    };


//- Render remaining cards -//

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
  

