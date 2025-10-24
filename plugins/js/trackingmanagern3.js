var trackingManager = (function IIFE($, global){

  var $trackClass, $progressEl;
  var trackingObject = {};
  var timer = 0;
  var userId = uniqueCourseId = moduleId = null;
  
  function parseHTML() {
    $trackClass.each(function loopOverhandler(){
      trackingObject[`${$(this).attr("id")}`] = {
        lastAccessedAt: null,
        totalTimeSpent: 0,
        clicked: false
      };
    });
  }

  function fetchAndCompareProgress() {
    sendRequest("../../../progreso.php", {
      'unique_course_id': uniqueCourseId,
      'module_id': moduleId,
      'asistencia_id': userId
    })
    .then(response => {
      if(response){
        var progressObject = JSON.parse(response.progress_object);
        $(`#progress_${uniqueCourseId}_${moduleId}`).html(response.progress+"%");
        for(let prop in trackingObject){
          if(progressObject.hasOwnProperty(prop) && progressObject[prop]['clicked']){
            trackingObject[prop] = {...progressObject[prop]};
            $(`#${prop}`).removeClass('btn-primary').addClass('read');
          }
        }
      }else{
        $(`#progress_${uniqueCourseId}_${moduleId}`).html(0+"%");
      }
    })
    .fail(err => {});
  }

  function startTracking(elementId){
    if(!elementId){
      return;
    }
    if(trackingObject.hasOwnProperty(`${elementId}`)){
      timer = performance.now();
      trackingObject[`${elementId}`] = {
        ...trackingObject[`${elementId}`],
        lastAccessedAt: +new Date(),
        clicked: true
      };
    }
  }

  function stopTracking(elementId){
    if(!elementId){
      return;
    }
    if(trackingObject.hasOwnProperty(`${elementId}`)){
      trackingObject[`${elementId}`] = {
        ...trackingObject[`${elementId}`],
        totalTimeSpent: trackingObject[`${elementId}`].totalTimeSpent + parseInt((performance.now() - timer) / 1000)
      };
      sendRequest("../../../update_progress.php", {
        'unique_course_id': uniqueCourseId,
        'module_id': moduleId,
        'progress_object': JSON.stringify(trackingObject),
        'asistencia_id': userId
      })
      .then(response => {
        $(`#progress_${uniqueCourseId}_${moduleId}`).html(response.progress+"%");
        $(`#${elementId}`).removeClass('btn-primary').removeClass('read').addClass('read');
      })
      .fail(err => {});
    }
  }

  function sendRequest(url, data){
    return $.ajax({
      url: url,
      type: 'POST',
      dataType: "json",
      data: data
    });
  }

  function init(opts, ...params){
    userId         = params[0];
    uniqueCourseId = params[1];
    moduleId       = params[2];
    $trackClass    = $(opts.trackClass);
    $progressEl    = $(opts.progressEl);
    parseHTML();
    fetchAndCompareProgress();
  }
  
  var publicAPI = {
    init: init,
    startTracking: startTracking,
    stopTracking: stopTracking
  };

  return publicAPI;

})(jQuery, window);

// Handle page visibility change events
function handleVisibilityChange() {
  elToTrack='';
if (document.visibilityState == "hidden") {
  if(elToTrack){
    trackingManager.startTracking(elToTrack);
  }
} else {
  if(elToTrack){
    trackingManager.stopTracking(elToTrack);
    elToTrack = null;
  }
}
}