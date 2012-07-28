(function(){
	var users = new Array();
	var hover_menu_div = null, hover_menu_contents_div;
	var hover_menu_css = 'horcrux_menu';
	var hover_menu_contents_css = 'horcrux_menu_contents';
	var initialized = false;
	
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
			// this is required to prevent 
			constructHoverMenu();
			fetchUsers();
			
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
	
	function clean(element)
	{
		$(element).html('');
		
		while(element.children.length)
		{
			element.removeChild(element.firstChild);
		}
	}
	
	// show hover menu
	function showHoverMenu(user)
	{
		var name = escapeString(user.innerHTML);
		var username = getUsername(user);
		$(hover_menu_div).offset({top: $(user).offset().top + $(user).outerHeight(), left: $(user).offset().left});
		curUser = user;
			
		chrome.extension.sendRequest({'method' : 'getUser', 'username': username, 'name': name}, function(response){
			var data = response["data"];
			populateCard(username, data);
			
			if(!data)
			{
					// request user's details, which in turn calls populate card with correct data
					requestUser(username, name);
			}
			
			if(hoverState == states.DISPLAY_HIDE_INVOKE)
			{
				hoverState = states.DISPLAY_SHOW_INVOKE;
				showCard();
			}
			else
			{
				// wait before showing
				hoverState = states.DISPLAY_SHOW_INVOKE;
				setTimeout( function(){
						showCard(user);
					}, 800);
			}
			
			function showCard(user)
			{
				if(curUser == user && hoverState == states.DISPLAY_SHOW_INVOKE)
				{
						hoverState = states.DISPLAY_ON;
						$(hover_menu_div).removeClass('hidden');
						$(hover_menu_div).offset({top: $(user).offset().top + $(user).outerHeight(), left: $(user).offset().left});
						$(hover_menu_div).css('opacity', 1);
						// $(hover_menu_div).animate({opacity:1}, 300, function() { } );
				}
			}
		});
	}
	
	function populateCard(username, data)
	{
			if(curUser && getUsername(curUser) != username)
			{
				return;
			}
			
			clean(hover_menu_contents_div);
			
			if(data)
			{
				var img = data["img"];
				var name_h1 = document.createElement('h1');
				name_h1.innerHTML = data["name"];
				
				var header = document.createElement("div");
				$(header).addClass('hover_header');
				header.appendChild(name_h1);
			
				if(data["intro"])
				{
					var intro = document.createElement("h2");
					intro.innerHTML = data["intro"];
					header.appendChild(intro);
				}
			
				var img_div = document.createElement('div');
				$(img_div).addClass('image');
				img_tag = document.createElement('img');
				img_tag.src = img;
				$(img_tag).addClass('hover_image');
				img_div.appendChild(img_tag);
				
				var info_div = document.createElement('div');
				$(info_div).addClass('info');
				
				var table = document.createElement('table');
				table.innerHTML = "<tr> \
										<td><h2>" + data["followers"] +"</h2> <h3>followers</h3></td> \
										<td><h2>" + data["following"] +"</h2> <h3>following</h3></td> \
									</tr> \
									<tr>  \
										<td><h2>" + data["topics"] +"</h2> <h3>topics</h3></td> \
										<td><h2>" + data["boards"] +"</h2> <h3>boards</h3></td> \
									</tr>";
				
				info_div.appendChild(table);
				
				var follow = document.createElement('div');
				$(follow).addClass('horcrux_follow');
				
				// follow button
				var span = document.createElement('span');
				$(span).addClass('quora-follow-button');
				span.setAttribute("data-name", username);
				span.appendChild(document.createTextNode('Loading Follow Status'));
				
				script = document.createElement('script');
				script.src = "http://qsc.cf.quoracdn.net/-c20a67afaf9f0d3a.js?embed_code=UnYGxfU";
				span.appendChild(script);
				follow.appendChild(span);
				
				var snippet = document.createElement('div');
				$(snippet).addClass('horcrux_contents_snippet');
				
				snippet.appendChild(img_div);
				snippet.appendChild(info_div);
				
				hover_menu_contents_div.appendChild(header);
				hover_menu_contents_div.appendChild(document.createElement('hr'));
				hover_menu_contents_div.appendChild(snippet);
				hover_menu_contents_div.appendChild(document.createElement('hr'));
				hover_menu_contents_div.appendChild(follow);
			}
			else
			{
				// $(hover_menu_contents_div).html('Loading Data.');
				var img = document.createElement('img');
				img.src = chrome.extension.getURL("images/spinner.gif");
				hover_menu_contents_div.appendChild(img);
			}
	}
	
	
	function hideHoverMenu()
	{
		curUser = null;
		hoverState = states.DISPLAY_HIDE_INVOKE;
		
		if(hoverState==states.DISPLAY_HIDE_INVOKE)
		{
			hoverState = states.DISPLAY_OFF;
			$(hover_menu_div).addClass('hidden');
			$(hover_menu_div).css('opacity', 0);
		}
		//$(hover_menu_div).animate({opacity:0}, 300, function() { 
		
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
		return decodeURIComponent(user.href).split('/')[3];
	}
	
	// update users
	function addUser(user)
	{
		if(users.indexOf(user) == -1)
		{
			var name = escapeString(user.innerHTML);
			var username = getUsername(user);
			
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
			
			// Uncomment for aggressive look-ahead caching - BAD FOR BANDWIDTH
			// requestUser(username, name);
		}
	}
	
	function requestUser(username, name)
	{
			// send request to background page
			chrome.extension.sendRequest({"method":"addUser", "username": username, "name": name }, function(response){
				populateCard(username, response["data"]);
			});
	}
})();