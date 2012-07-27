(function(){
	var users = new Array();
	var cache = {};
	var hover_menu_div, hover_menu_contents_div;
	var hover_menu_css = 'horcrux_menu';
	var hover_menu_contents_css = 'horcrux_menu_contents';
	
	var states = {
		"DISPLAY_SHOW_INVOKE":0,
		"DISPLAY_ON":1,
		"DISPLAY_OFF":2,
		"DISPLAY_CANCEL":3,
		"DISPLAY_HIDE_INVOKE":4
	}
	
	var hoverState;
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
		$(hover_menu_nub_div).addClass("horcrux_menu_nub");
		
		// var nub = chrome.extension.getURL('images/nub.png');
		hover_menu_contents_div = document.createElement('div');
		$(hover_menu_contents_div).addClass(hover_menu_contents_css);
		
		hover_menu_div.appendChild(hover_menu_nub_div);
		hover_menu_div.appendChild(hover_menu_contents_div);
		
		$(hover_menu_div).mouseleave(function(e)
		{
			
			if(e.pageY > $(curUser).offset().bottom || e.pageY < $(curUser).offset().top 
				|| e.pageX > $(curUser).offset().left +  $(curUser).outerWidth() || e.pageX < $(curUser).offset().left)
			{
				hideHoverMenu(); 
			}
		});
		
		console.log("<horcrux> Constructed hover menu");
		$("body").append(hover_menu_div);
		$(".horcrux_menu_nub").css("background", "url('http://qsf.cf.quoracdn.net/-f5369c624463f0f6.png') no-repeat scroll 10px top transparent");
	}
	
	// show hover menu
	function showHoverMenu(user)
	{
		var name = escapeString(user.innerHTML);
		var username = getUsername(user);
		hoverState = states.DISPLAY_SHOW_INVOKE;
		$(hover_menu_div).offset({top: $(user).offset().top + $(user).outerHeight(), left: $(user).offset().left});
		$(hover_menu_contents_div).html('');
		
		while(hover_menu_contents_div.children.length)
		{
			hover_menu_contents_div.removeChild(hover_menu_contents_div.firstChild);
		}
		
		if(cache.hasOwnProperty(username))
		{
			var img = cache[username]["img"];
			
			var name_h1 = document.createElement('h1');
			name_h1.innerHTML = name;
			
			var hr = document.createElement('hr');
			
			var header = document.createElement("div");
			$(header).addClass('hover_header');
			
			header.appendChild(name_h1);
		
			if(cache[username]["intro"])
			{
				var intro = document.createElement("h2");
				intro.innerHTML = cache[username]["intro"];
				header.appendChild(intro);
			}
			
			hover_menu_contents_div.appendChild(header);
			hover_menu_contents_div.appendChild(hr);
			
			var img_div = document.createElement('div');
			$(img_div).addClass('image');
			img_tag = document.createElement('img');
			img_tag.src = img.src;
			$(img_tag).addClass('hover_image');
			img_div.appendChild(img_tag);
			
			var info_div = document.createElement('div');
			$(info_div).addClass('info');
			
			var table = document.createElement('table');
			table.innerHTML = "<tr> \
									<td><h2>" + cache[username]["followers"] +"</h2> <h3>followers</h3></td> \
									<td><h2>" + cache[username]["following"] +"</h2> <h3>following</h3></td> \
								</tr> \
								<tr>  \
									<td><h2>" + cache[username]["topics"] +"</h2> <h3>topics</h3></td> \
									<td><h2>" + cache[username]["boards"] +"</h2> <h3>boards</h3></td> \
								</tr>";
			
			info_div.appendChild(table);
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
			if(curUser == user && hoverState == states.DISPLAY_SHOW_INVOKE)
			{
					hoverState = states.DISPLAY_ON;
					$(hover_menu_div).removeClass('hidden');
					$(hover_menu_div).offset({top: $(user).offset().top + $(user).outerHeight(), left: $(user).offset().left});
					$(hover_menu_div).animate({opacity:1}, 300, function() { } );
			}
		}, 1200);
		
	}
	
	function hideHoverMenu()
	{
		curUser = null;
		hoverState = states.DISPLAY_HIDE_INVOKE;
		$(hover_menu_div).animate({opacity:0}, 300, function() { 
			if(hoverState==states.DISPLAY_HIDE_INVOKE)
			{
				hoverState = states.DISPLAY_OFF;
				$(this).addClass('hidden');
			}});
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
	}
	
	//handle mouse leave
	function onMouseLeave()
	{
		hideHoverMenu();
	}
	
	// escape
	function escapeString(str)
	{
		return str.replace("'","\'").replace('"','\"');
	}
	
	function getUsername(user)
	{
		return user.href.split('/')[3];
	}
	
	// update users
	function addUser(user)
	{
		if(users.indexOf(user) == -1)
		{
			var name = escapeString(user.innerHTML);
			var username= getUsername(user);
			console.log("<horcrux> adding new tag for user " + name);
			users.push(user);
			$(user).mouseenter(function(){ onMouseEnter(this); });
			
			$(user).mouseleave(function(e)
			{ 
				if(hoverState == states.DISPLAY_SHOW_INVOKE)
				{
					hoverState = states.DISPLAY_CANCEL;
					onMouseLeave(this);
				}
					
				if(e.pageY < $(hover_menu_div).offset().top)
				{
					onMouseLeave(this);
				}
			});
			
			// update cache
			if(!cache.hasOwnProperty(username))
			{
				console.log("<horcrux> Adding cache entry for : " + name);
				fetchCacheData(user);
			}
		}
	}
	
	// fetch data
	function fetchCacheData(user)
	{
		var userName = getUsername(user);
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
					intro = $(response).find(".rep")[1];
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
				"boards":boards == undefined ? 0 : boards.innerHTML,
				"intro" : intro == undefined ? undefined : intro.innerHTML 
				};
				
				cache[userName] = data;
			},
			error : function(xhr, textStatus, errorThrown)
			{
				console.log("<horcrux> " + textStatus + " = " + errorThrown);
			}
		});	
	}
	
	// image cache
})();