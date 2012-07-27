(function(){
	var users = new Array();
	var cache = {};
	var hover_menu_div, hover_menu_contents_div;
	var hover_menu_css = 'horcrux_menu';
	var hover_menu_contents_css = 'horcrux_menu_contents';
	var curUser = null;
	
	// document ready
	$(document).ready(function(){
			fetchUsers();
			constructHoverMenu();
			
			$("body").bind("DOMSubtreeModified", function() {
					// console.log("tree changed");
					fetchUsers();
			});
	});
	
	// construct hover menu
	function constructHoverMenu()
	{
		hover_menu_div = document.createElement('div');
		$(hover_menu_div).addClass(hover_menu_css);
		$(hover_menu_div).addClass('hidden');
		$(hover_menu_div).css('opacity', 0);
		
		var hover_menu_nub_div = document.createElement('div');
		$(hover_menu_nub_div).addClass("hover_menu_nub_div");
		
		hover_menu_contents_div = document.createElement('div');
		$(hover_menu_contents_div).addClass(hover_menu_contents_css);
		
		hover_menu_div.appendChild(hover_menu_nub_div);
		hover_menu_div.appendChild(hover_menu_contents_div);
		
		console.log("<horcrux> Constructed hover menu");
		$("body").append(hover_menu_div);
	}
	
	// show hover menu
	function showHoverMenu(user)
	{
		var name = escapeString(user.innerHTML);
		$(hover_menu_contents_div).html('');
		
		while(hover_menu_contents_div.children.length)
		{
			hover_menu_contents_div.removeChild(hover_menu_contents_div.firstChild);
		}
		
		if(cache.hasOwnProperty(name))
		{
			var img = cache[name]["img"];
			
			var name_h1 = document.createElement('h1');
			name_h1.innerHTML = name;
			
			var hr = document.createElement('hr');
			
			hover_menu_contents_div.appendChild(name_h1);
			hover_menu_contents_div.appendChild(hr);
			
			var img_div = document.createElement('div');
			$(img_div).css('float', 'left');
			img_div.appendChild(img);
			
			var info_div = document.createElement('div');
			$(info_div).css('float', 'left');
			
			var ul = document.createElement('ul');
			
			var span_followers = document.createElement('li');
			span_followers.innerHTML = "<h2>"+cache[name]["followers"]+"</h2> followers"
			ul.appendChild(span_followers);
			
			var span_following = document.createElement('li');
			span_following.innerHTML = "<h2>"+cache[name]["following"]+"</h2> following"
			ul.appendChild(span_following);
			
			var span_topics = document.createElement('li');
			span_topics.innerHTML = "<h2>"+cache[name]["topics"]+"</h2> topics"
			ul.appendChild(span_topics);
			
			$(info_div).addClass('info');
			var span_boards = document.createElement('li');
			span_boards.innerHTML = "<h2>"+cache[name]["boards"]+"</h2> boards"
			ul.appendChild(span_boards);
			
			info_div.appendChild(ul);
			hover_menu_contents_div.appendChild(img_div);
			hover_menu_contents_div.appendChild(info_div);
		}
		else
		{
			$(hover_menu_contents_div).html('Still loading data. Please hover in a while :(	');
		}
		
		curUser = user;
		
		// wait before showing
		setTimeout( function(){
			if(curUser == user)
			{
					$(hover_menu_div).removeClass('hidden');
					$(hover_menu_div).offset({top: $(user).offset().top + 20, left: $(user).offset().left});
					$(hover_menu_div).animate({opacity:1}, 500, function() { } );
			}
		}, 1000);
		
	}
	
	function hideHoverMenu()
	{
		curUser = null;
		$(hover_menu_div).animate({opacity:0}, 500, function() { $(this).addClass('hidden');} );
	}
	
	// fetch users
	function fetchUsers()
	{
		$('a[class|="user"]').each(function(index)
		{
			addUser(this);
		})
	}
	
	//handle mouse enter
	function onMouseEnter(user)
	{
		showHoverMenu(user);
		console.log("<horcrux> Entering user: " + cache[escapeString(user.innerHTML)]["img"].src);
	}
	
	//handle mouse leave
	function onMouseLeave(user)
	{
		hideHoverMenu();
		console.log("<horcrux> Leaving user: " + user.href);
	}
	
	// escape
	function escapeString(str)
	{
		return str.replace("'","\'").replace('"','\"');
	}
	
	// update users
	function addUser(user)
	{
		if(users.indexOf(user) == -1)
		{
			var name = escapeString(user.innerHTML);
			console.log("<horcrux> adding new tag for user " + name);
			users.push(user);
			$(user).mouseenter(function(){ onMouseEnter(this); });
			$(user).mouseleave(function(){ onMouseLeave(this); });
		
			// update cache
			if(!cache.hasOwnProperty(name))
			{
				console.log("<horcrux> Adding cache entry for : " + name);
				fetchCacheData(user);
			}
		}
	}
	
	// fetch data
	function fetchCacheData(user)
	{
		var userName = user.href.split('/')[3];
		var name = escapeString(user.innerHTML);
		
		var img;
		var followers, following, topics, boards;
		var data;
		
		$.ajax({
			url: user.href,
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
					
					followers = $(response).find("a[href|='/"+userName+"/followers'] > span")[0];
					following = $(response).find("a[href|='/"+userName+"/following'] > span")[0];
					topics = $(response).find("a[href|='/"+userName+"/topics'] > span")[0];
					boards = $(response).find("a[href|='/"+userName+"/boards'] > span")[0];
				}
				catch(e)
				{
					console.log("<horcux> [error] for user : " + user.href  + ", " + e );
				}
				
				data = {
				"name": name,
				"img":img,
				"followers":followers == undefined ? 0 : followers.innerHTML,
				"following":following == undefined ? 0 : following.innerHTML,
				"topics":topics == undefined ? 0 : topics.innerHTML,
				"boards":boards == undefined ? 0 : boards.innerHTML
				};
				
				cache[name] = data;
				console.log(data);
			},
			error : function(xhr, textStatus, errorThrown)
			{
				console.log("<horcrux> " + textStatus + " = " + errorThrown);
			}
		});	
	}
	
	// image cache
})();