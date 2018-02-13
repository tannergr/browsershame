/*
*TODO:  - day transistion saves current time to next day
*        ?make asynchronous checker with global variable when new day
*       - save time on page change or close: use onunload
*/



const MAX_TIME_ON_SITE = 1*60*60*1000; // 1 hour

// Div creation and styling
var div=document.createElement("div");

div.style.top = 0;
div.style.left = 0;
div.style.position = "fixed";
div.style.zIndex = 9999999999999999999;
div.style.backgroundColor = "rgba(0,0,0,0.3)";
document.body.appendChild(div);


// Actual event listeners
var timeOnSite;
var storage = chrome.storage.sync;
var key = String(window.location.hostname);
var focus = true;
var focusTime = Date.now(); // Time at which tab last came into focus or time was updated
var currDate = dateString();

// Get initial time from storage
// If none exists create and save
storage.get(key, function (time) {
    var siteTimes = time[key]; // Get key for certain day

    // Check if there is no entry for the site
    // Or an invalid entry from a previous version of plugin
    if(siteTimes == null || !isNaN(siteTimes)){
      siteTimes = {}; // create object for site
      siteTimes[currDate] = 0; // Initialize day entry
      var storeObj = {}; // Create storage object
      storeObj[key] = siteTimes; // add site object to storage object
      storage.set(storeObj); // Save storage object to memory
      timeOnSite = 0;
    }
    // Check if valid site entry has an entry for the current day
    else if(siteTimes[currDate] == null){
      siteTimes[currDate] = 0; // Add current day to existing site entry
      var storeObj = {}; // Create storage object
      storeObj[key] = siteTimes; // add updated site memory to storage object
      storage.set(storeObj); // save to memory
      timeOnSite = 0;
    }
    // this executes when the current site is in memory with a current date entry
    else{
      timeOnSite = siteTimes[currDate];
    }
});

// listens for tab coming into focus
window.addEventListener('focus', function() {
  // Timout probably not needed, used to ensure last tab finishes saving before this
  window.setTimeout(()=>{
    focus = true; // tell routine that tab is in focus
    focusTime = Date.now();
    // Retrieve time from memory
    storage.get(key, function (time) {
        var siteTimes = time[key];
        // Check if date entry valid,
        // if not, save to new day with time = 0
        // This only happens when a tab is out of focus before midnight then
        // focused after midnight
        if(siteTimes[currDate] == null){
          siteTimes[currDate] = 0;
          var storeObj = {};
          storeObj[key] = siteTimes;
          storage.set(storeObj);
          timeOnSite = 0;
        }
        else{
          timeOnSite = siteTimes[currDate];
        }
    });
  }, 10);
});

var savecounter = 0;
window.addEventListener('blur', function() {
    focus = false;
    storage.get(key, function (time) {
      var siteTimes = time[key];
      // Check for new day
      if(currDate != dateString()){
        currDate = dateString();
        timeOnSite = 0;
      }

      siteTimes[currDate] = timeOnSite;
      var storeObj = {};
      storeObj[key] = siteTimes;
      storage.set(storeObj);
    });

    // savecounter+=1;
    // console.log("saved time", savecounter);
});
window.onbeforeunload= ()=>{
  alert("leaving");
  focus = false;
  storage.get(key, function (time) {
    var siteTimes = time[key];
    // Check for new day
    if(currDate != dateString()){
      currDate = dateString();
      timeOnSite = 0;
    }

    siteTimes[currDate] = timeOnSite;
    var storeObj = {};
    storeObj[key] = siteTimes;
    storage.set(storeObj);
  });
}

// Update timer, update color
var intervalID = window.setInterval(myCallback, 10);
var counter = 0;
function myCallback() {
  if(focus){
    // update time based on last time and time since last time
    timeOnSite += Date.now() - focusTime;
    focusTime = Date.now();
    div.innerText =
      window.location.hostname + " : " + msToTime(timeOnSite);
    div.style.backgroundColor = timeToRGBA(timeOnSite, MAX_TIME_ON_SITE);
  }
}
// Checks to see if enabled flag has been changed in memory viea popup
window.setInterval(()=>{
  storage.get(key, function (time) {
    var currDate = dateString();
    siteTimes = time[key];
    if(siteTimes["enabled"]!=null){
      if(siteTimes["enabled"]==false){
        div.style.display = "none";
      }
      else{
        div.style.display = "block";
      }
    }
  });
}, 10);

// Linear color change based on time and max time
function timeToRGBA(time, maxTime){
  var startColour = [66, 244, 69];
  var endColour = [255, 0, 38];
  var startOpacity = 0.3;
  var endOpacity = 0.8;
  if(time > maxTime) time = maxTime;
  var rVal = colourFormula(startColour[0], endColour[0], time, maxTime);
  var gVal = colourFormula(startColour[1], endColour[1], time, maxTime);
  var bVal = colourFormula(startColour[2], endColour[2], time, maxTime);
  var aVal = colourFormula(startOpacity, endOpacity, time, maxTime);
  return "rgba(" + rVal + "," + gVal + "," + bVal + "," + 1 + ")";
}

function colourFormula(startNum, endNum, time, endTime){
  return Math.floor(startNum+(endNum-startNum)*time/endTime);
}

// Time functions from stack overflow
function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs ;
}

function dateString() {
  var date = new Date();
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var dd = date.getDate();

  return [date.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};
