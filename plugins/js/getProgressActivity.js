
function getProgressActivity(userId, courseId, moduleId, fullName, percentage, activity_id, correct, total){
    $.ajax({
        type: "POST", 
        url: "../../progress_reinforcement_activities.php",
        data: {
            user_id: userId,
            full_name: fullName,
            module_id: moduleId,
            course_id: courseId,
            activity_id: activity_id,
            total_cuestions : total,
            correct : correct,
            percentage: percentage
        },
        success: function (response) {
            console.log(response);
        }
    });
} 