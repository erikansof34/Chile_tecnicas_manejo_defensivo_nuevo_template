var trackingManager_activities = (function IIFE($, global) {
	// ...
	function getProgress(userId, courseId, moduleId, fullName, percentage, activityId) {
		$.ajax({
			type: "POST",
			url: "../../update_progress_activity.php",
			data: {
				resultado: percentage,
				userId: userId,
				courseId: courseId,
				moduleId: moduleId,
				fullName: fullName,
				activityId: activityId
			},
			success: function (response) {
				console.log(response);
			}
		});
	}

	function handleVisibilityChange2(userId, courseId, moduleId, fullName, activityId) {
		if (document.hidden) {
			$.ajax({
				type: "POST",
				url: "../../update_progress_activity.php",
				data: {
					userId: userId,
					courseId: courseId,
					moduleId: moduleId,
					fullName: fullName,
					progress: $('.hideT').length,
					activityId: activityId
				},
				success: function (response) {
					console.log(response);
				}
			});
		}
	}

	document.addEventListener('visibilitychange2', function () {
		handleVisibilityChange2(userId, courseId, moduleId, fullName);
	}, false);

	return {
		getProgress: getProgress // Exportar la función getProgress
	};
})(jQuery, window);
