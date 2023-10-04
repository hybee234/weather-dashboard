var searchFormEl = document.querySelector('#search-form'); 
var languageButtonsEl = document.querySelector('#language-buttons'); //buttons to select JS, HTML, CSS
var searchInputEl = document.querySelector('#search-field');
var forecastContainerEl = document.querySelector('#forecast-container');
var subtitleTermEl = document.querySelector('#repo-search-term'); // name that comes after "weather forecaast for:"

var apiKey = "ebe9a8cb2cc6f41abc680b652e9804b6";
var lat = "-37.81373321550253";
var lon = "144.96284987796403";

var search = ""
var coordDataArray = [];
var forecastDataArray = [];

//------------------------------//
//- Check if location is empty -//
//------------------------------//

function checkSearchEmpty(event) {  
  console.log("\n\n\n > checkSearchEmpty() Called");   
  event.preventDefault();
  search = searchInputEl.value.trim();         // Set value of global var "location" = value in search field (trimmed)
  console.log("  search captured is: " + search);  
   if (search !=="") {                           //if search is truthy then execute code block
     console.log("   search not empty - Good"); 
     forecastContainerEl.textContent = '';         //clear forecast container (list of forecast)
     searchInputEl.value = '';                    //clear search field
     fetchCoordinates();                      // Use named location to fetch co-ordinates to use in the weather forecast API
   } else {
    console.log("   search is empty - bad")  
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
  console.log ("\n\n\n > coordinates() called")
  var apiCoordinates = "http://api.openweathermap.org/geo/1.0/direct?q="+ search + "&limit=5&appid=" + apiKey;     // to get longitude/latitude info
  console.log("  fetching coordinates")
  fetch(apiCoordinates).then(function (response) {      
    if (response.ok) {
      console.log("  Coordinates API Response OK");
      console.log("  Storing response in coordData object");
      response.json().then(function (coordData) {   //store API reponse in "coordData" JSON object
      console.log("Response from from coordinates API:")
      console.log(coordData);
        //displayRepos(data,search);
        //If the "data" array is zero length (i.e. no location found) then present alert indication this, otherwise assign latitude and longtitude to variables
        if ( coordData.length === 0 ) {
          alert ('No location found - please try again')
        } else {
          coordDataArray = [];
          for (let i=0; i < coordData.length; i++) {coordDataArray.push(coordData[i]) }; // for loop to push coordData values one at a time into coordDataArray global object
          console.log("Coordinate API data pushed into global object")
          console.log(coordDataArray)
          lat = coordData[0].lat;
          lon = coordData[0].lon;          
          console.log("  coordData[0] values\n  -------------------\n  Lat: " + coordData[0].lat + "\n  Lon: " + coordData[0].lon + "\n  Country: " + coordData[0].country+ "\n  Name: " + coordData[0].name+ "\n  State: " + coordData[0].state);
          fetchForecast();
        }
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
  console.log("  search = " + search)
  var apiForecast = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=metric&cnt=40&appid=" + apiKey
  console.log("  fetching forecast")  
  fetch(apiForecast).then(function (response) {      
    if (response.ok) {
      console.log("  Forecast API Response OK");
      console.log("  Storing response in forecastData object");
      response.json().then(function (forecastData) {  //store API reponse in "forecastData" JSON object
      console.log("Response from from forecast API:")
      console.log(forecastData);

      for (let i=0; i < forecastData.list.length; i++) {forecastDataArray.push(forecastData.list[i]) }; // for loop to push coordData values one at a time into coordDataArray global object
      console.log("forecast API data pushed into global object")
      console.log(forecastDataArray)


      displayForecast(forecastData,search);
      });
    } else {
      alert('Error in forecast: ' + response.statusText); // Can connect to API server but error sent back
    }
  })
  .catch(function (error) {
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

//---------------------------//
//- Display Forecaset Repo container -//
//---------------------------//
function displayForecast (forecastData, search) {
  console.log("\n\n\n > displayForecast() Called");
  console.log("  forecastData = ");
  console.log(forecastData);
  console.log("  search = '" + search + "'"); 
 //Checking if forecastData has zero length (i.e. no values)
  if (forecastData.length === 0) {
    forecastContainerEl.textContent = 'No weather forcasts found.';
    return;
  }

                       // Set title to include location "Weather forecast for" - why is the location the web address? When did this change?
  
subtitleTermEl.textContent = forecastData.city.name + ", " + coordDataArray[0].state + ", " + forecastData.city.country;
console.log ("coordDataArray")
console.log (coordDataArray);

                        // for loop to create forcast text, create 3 HTML elements and append
  for (var i = 0; i < 20; i++) {
    
                            // Declare var AEDT store date/time convert from Unix to AEDT
    var AEDT = dayjs.unix(forecastData.list[i].dt).format('ddd, D/M/YYYY, HH:mm:ss A');
                           // Declare weatherForecast variable and store weather forecast text 
    var forecastText = i + ". City: " + forecastData.city.name + ", Date/Time: " + AEDT + " AEDT , Temp: " + forecastData.list[i].main.temp + ", Min: " + forecastData.list[i].main.temp_min + ", Max: " + forecastData.list[i].main.temp_max;  //build the forecst
    console.log(forecastText);
        
    var forecastEl = document.createElement('div');                                       // Declare var forecastEl - create new 'div' element
        forecastEl.classList = 'list-item flex-row justify-space-between align-center';   // Add classes to new 'div' element

    var titleEl = document.createElement('span');                                         // Declare var title El - create new 'span' element
        titleEl.textContent = forecastText;                                            // Add weatherForcast text to the new span element
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
