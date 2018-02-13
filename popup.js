function toggle(){
  console.log("running");
  var storage = chrome.storage.sync;
  var tabURL;
  chrome.tabs.query({active:true, currentWindow:true},
    function(tabs) {
      tabURL = tabs[0].url;
      var pathArray = tabURL.split( '/' );
      var protocol = pathArray[0];
      var host = pathArray[2];
      var url = protocol + '//' + host;
      var key = host;
      storage.get(function (time) {
        console.log(time)
        var siteTimes = time[key];
        if(siteTimes["enabled"] == null){
          siteTimes["enabled"] = false;
        }
        else{
          siteTimes["enabled"] = !siteTimes["enabled"]
        }
        var storeObj = {};
        storeObj[key] = siteTimes;
        storage.set(storeObj);
    });
  });
}
window.onload = () => {
  document.getElementById("toggleButton").addEventListener("click", toggle);
};
document.querySelector('#go-to-options').addEventListener("click",function() {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options.html'));
  }
});
