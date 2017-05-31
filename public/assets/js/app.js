$(document).ready(function(){


	$(document).on("click", ".delete-button", function(element){

		element.preventDefault();

		let articleID = $(this).siblings("input.articleID").val();
		let commentID = $(this).siblings("input.commentID").val();

		console.log("commentID:", commentID);
		console.log("articleID:", articleID);
		
		let post ={
			"articleID": articleID,
			"commentID" : commentID
		};
	
		$.ajax({
      		method: "POST",
      		url: "/api/delete-comment" ,
      		data: post
    	})
    	.done(function(data) {
     	
     		if(data.complete)
     		{
     			removeComment(commentID);	
     		}
     		console.log("data:", data);
     
    	});
	
	});

});


function removeComment (commentID)
{
	$("#" + commentID + "group").remove();
	
}


