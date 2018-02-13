window.onload = () => {
  dispDaily();
};

var storage = chrome.storage.sync;

function dispDaily(){
  var ds = dateString();
  var results =   document.getElementById("results");
  var resultArray = [];
  storage.get(function (allData) {
    for (var key in allData) {
        // skip loop if the property is from prototype
        if (!allData.hasOwnProperty(key)) continue;

        var obj = allData[key];
        for (var prop in obj) {
            // skip loop if the property is from prototype
            if(!obj.hasOwnProperty(prop)) continue;

            // your code
            if(prop == ds && obj[ds] > 0){
              resultArray.push([key, obj[ds]]);
              console.log(([key, obj[ds]]).toString());
            }
        }
    }
    resultArray.sort(function(a,b){
      return b[1] - a[1];
    });
    var labelArray = [];
    var timeArray = [];
    var display = 10;
    var count = 0;
    resultArray.forEach((item)=>{
      if(count < display){
        labelArray.push(item[0]);
        timeArray.push(item[1]);
      }
      else if(count == display){
        labelArray.push("Other");
        timeArray.push(item[1]);
      }
      else{
        timeArray[display] += item[1];
      }
      count++;
    });


    // BUILD CHART
    var ctx = document.getElementById("myChart");
    var dataset = [];
    for(i = 0; i<= display;i++){
      dataset.push({
        label: labelArray[i],
        data: [timeArray[i]],
        backgroundColor: timeToRGBA(timeArray[i], 1000*60*60),
      });
    }
    var barChartData = {
      //labels: labelArray,
      datasets:  dataset
    }
    var myBarChart = new Chart(ctx, {
      type: 'bar',
      data: barChartData,
      options:{
        legend: {
            display: true
        },
        maintainAspectRatio: false,
        scaleShowValues: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              userCallback: function(v) { return epoch_to_hh_mm_ss(v) },
              //stepSize:300, //add a tick every 5 minutes
            }
          }],
          xAxes: [{
            ticks: {
              autoSkip: false
            }
          }]
        },
        tooltips: {
         callbacks: {
           label: function(tooltipItem, data) {
             return data.datasets[tooltipItem.datasetIndex].label + ":"+epoch_to_hh_mm_ss(tooltipItem.yLabel)
           }
         }
       }
      }
    });
  });
}

  function epoch_to_hh_mm_ss(epoch) {
    return new Date(epoch).toISOString().substr(12, 7)
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
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
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
