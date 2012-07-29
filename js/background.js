!function()
{
	var cache = {};
	var MAX_LENGTH = 20
	
	chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse)
		{
			if(request['method'] == "addUser")
			{
				var username = request["username"];
				var name = request["name"];
				
				console.log("<horcrux> Background addUser: " + username); 
				
				if(Object.keys(cache).length > MAX_LENGTH)
				{
					console.log("<horcrux> Clearing cache");
					clear(cache);
				}
				
				addUser(username, name, sendResponse);
			}
			
			if(request['method'] == "getUser")
			{
				var username = request["username"];
				console.log("<horcrux> Background getUser: " + username); 
				
				if(isUser(username))
				{
					sendResponse({"data" : cache[username]});
				}
				else
				{
					sendResponse({"data":null});
				}
			}
			
			if(request['method'] == 'isUser')
			{
				var username = request["username"];
				console.log("<horcrux> Background isUser: " + username); 
				sendResponse({"data" : isUser(username) });
			}
		}
	)
	
	// clear cache
	function clear(obj)
	{
		for(key in obj)
		{
			if(obj.hasOwnProperty(key))
			{
				delete(obj[key]);
			}
		}
	}
	
	// isUser
	function isUser(username)
	{
		return cache.hasOwnProperty(username);
	}
	
	function addUser(username, name, callback)
	{
		
		// update cache
		if(!isUser(username))
		{
			console.log("<horcrux> Adding cache entry for : " + username);
			fetchCacheData(username, name, callback);
		}
		else
		{
			console.log("<horcrux> cache entry already present : " + username);
		}
	}
	
	// fetch user data
	function fetchCacheData(username, name, callback)
	{
		var img;
		var followers, following, topics, boards;
		var data;
		
		$.ajax({
			url: "http://www.quora.com/"+username,
			dataType:'html',
			success: function(response)
			{
				try
				{
					img = $(response).find("img.profile_photo_img[alt='"+ name +"']")[0];
					
					if(!img)
					{
						img = $(response).find("img.profile_photo_img[width='200']")[0];
					}
					
					followers = $(response).find("a[href|='/"+username+"/followers'] > span")[0];
					following = $(response).find("a[href|='/"+username+"/following'] > span")[0];
					topics = $(response).find("a[href|='/"+username+"/topics'] > span")[0];
					boards = $(response).find("a[href|='/"+username+"/boards'] > span")[0];
					intro = $(response).find(".rep")[1];
				}
				catch(e)
				{
					console.log("<horcux> [error] for user : " + username  + ", " + e );
				}
				
				data = {
				"name": name,
				"img":img.src,
				"followers":followers == undefined ? 0 : followers.innerHTML,
				"following":following == undefined ? 0 : following.innerHTML,
				"topics":topics == undefined ? 0 : topics.innerHTML,
				"boards":boards == undefined ? 0 : boards.innerHTML,
				"intro" : intro == undefined ? undefined : intro.innerHTML 
				};
				
				cache[username] = data;
				console.log("<horcrux> Successfully added cache entry for " + username);
				callback({"data" : cache[username]});
			},
			error : function(xhr, textStatus, errorThrown)
			{
				console.log("<horcrux> " + textStatus + " = " + errorThrown);
				callback({"data" : "error"});
			}
		});	
	}
}();