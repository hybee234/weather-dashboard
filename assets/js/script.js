var locationFormEl = document.querySelector('#location-form');
var languageButtonsEl = document.querySelector('#language-buttons'); //buttons to select JS, HTML, CSS
var locationInputEl = document.querySelector('#location');
var repoContainerEl = document.querySelector('#repos-container');
var repoSearchTerm = document.querySelector('#repo-search-term'); // name that comes after "weather forecaast for:"

//-------------------------------//
//- Prepare request by location -//
//-------------------------------//

function formSubmitHandler(event) {  
  console.log("")
  console.log("> formSubmitHandler() Called")   
  event.preventDefault();
  var location = locationInputEl.value.trim();   // declare local var "location" = value in location search field
  console.log("  Location captured is: " + location);
  
   if (location) {              //if location is truthy then execute code block
    console.log("Location is truthy"); 
    locationForecast(location);     //location 
     repoContainerEl.textContent = '';  //clear repo container (list of forecast)
     locationInputEl.value = '';       //clear location search field
   } else {
    console.log("Location is falsy")  
    alert('Please enter a location');  //if location is falesy then request location
   }
};

//-------------------------------//
//- Prepare request by language -//
//-------------------------------//
function buttonClickHandler (event) {
  console.log("")
  console.log("> buttonClickHandler() Called")  
  var language = event.target.getAttribute('data-language');  // declare local var "language" = data-language value of element that triggered

  if (language) {     // if language is truthy then carry out the block
    getFeaturedRepos(language);   // execute getFeaturedRepos wit
    repoContainerEl.textContent = ''; //clear any existing repo/weather forecast displayed.
  }
};

//------------------------------//
//- Fetch Forecast by Location -//
//------------------------------//

function locationForecast (location) {
  console.log("")
  console.log("> locationForecast() Called")
  console.log(" Declaring apiURL ")
  var apiUrl = "http://api.openweathermap.org/data/2.5/forecast?q=Fukuoka&appid=ebe9a8cb2cc6f41abc680b652e9804b6&unit=metric"
  
  //var apiUrl = "http://api.openweathermap.org/data/2.5/forecast?lat=-37.81373321550253&lon=144.96284987796403&appid=ebe9a8cb2cc6f41abc680b652e9804b6&units=metric&cnt=40"
  //var apiUrl = "https://api.openweathermap.org/data/3.0/onecall?lat=-37.81373321550253&lon=144.96284987796403&exclude=minutely,hourly,alerts,current&appid=ebe9a8cb2cc6f41abc680b652e9804b6&units=metric"
  
  console.log(" fetching ")
  fetch(apiUrl)
    .then(function (response) {
      console.log(" function response initiating")
      if (response.ok) {
        console.log("response OK");
        response.json()
        .then(function (data) {
          console.log(data);
          displayRepos(data,location);
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to Openweathermap');
    });
};

//---------------------------//
//- Fetch Repos by Language -//
//---------------------------//
function getFeaturedRepos (language) {
  console.log("")
  console.log("> getFeaturedRepos() Called")  
  var apiUrl = 'https://api.github.com/search/repositories?q=' + language + '+is:featured&sort=help-wanted-issues';

  fetch(apiUrl)  //fetch URL above
  .then(function (response) {   //then do something with the response
    console.log(" function response initiating")
    if (response.ok) {
      console.log("response OK");
      response.json()     //convert response into json object
      .then(function (data) {   //Data now in JSON Format
        console.log(data);
        displayRepos(data.items, language);
      });
    } else {
      alert('Error: ' + response.statusText);
    }
  })
  .catch(function (error) {
    alert('Unable to connect to Openwetahermap');
  });
};

//---------------------------//
//- Populate Repo container -//
//---------------------------//
function displayRepos (openweather, searchTerm) {
  console.log("");
  console.log("> displayRepos() Called");
  console.log("openweather = ");
  console.log(openweather);
  console.log("Search Term = '" + searchTerm + "'");
  
  if (openweather.length === 0) {
    repoContainerEl.textContent = 'No weather forcasts found.';
    return;
  }

  repoSearchTerm.textContent = searchTerm;

  for (var i = 0; i < 40; i++) {
    var weatherForecast = "City: " + openweather.city.name + ", Date: " + openweather.list[i].dt_txt + ", Temperature: " + openweather.list[i].main.temp + ", Min: " + openweather.list[i].main.temp_min + ", Max: " + openweather.list[i].main.temp_max;  //build the forecst
    console.log(weatherForecast);

    var repoEl = document.createElement('div');
    repoEl.classList = 'list-item flex-row justify-space-between align-center';

    var titleEl = document.createElement('span');
    titleEl.textContent = weatherForecast;

    repoEl.appendChild(titleEl);

    var statusEl = document.createElement('span');
    statusEl.classList = 'flex-row align-center';

    // if (repos[i].open_issues_count > 0) {
    //   statusEl.innerHTML =
    //     "<i class='fas fa-times status-icon icon-danger'></i>" + repos[i].open_issues_count + ' issue(s)';
    // } else {
    //   statusEl.innerHTML = "<i class='fas fa-check-square status-icon icon-success'></i>";
    // }

    repoEl.appendChild(statusEl);
    repoContainerEl.appendChild(repoEl);
  }
};

//-----------------------------------------------//
//- Listener to capture click to "Get Forecast" -//
//-----------------------------------------------//

locationFormEl.addEventListener('submit', function(event) {
  console.log("");
  console.log("! userFormEl Clicked");  
  formSubmitHandler(event);
})


//----------------------------------------------------//
//- Listener to capture click to "Previous Searches" -//
//----------------------------------------------------//

languageButtonsEl.addEventListener('click', function(event) {
  console.log("");
  console.log("! languageButtonsEl Clicked");  
  buttonClickHandler(event);
});
