var oauth=ChromeExOAuth.fromConfig({
			'request_url': "http://api.t.sina.com.cn/oauth/request_token",
			'authorize_url': "http://api.t.sina.com.cn/oauth/authorize",
			'access_url': "http://api.t.sina.com.cn/oauth/access_token",
			'consumer_key':"1242839386",
			'consumer_secret': "b1f1dcb9134cd3ab57d1914116301471",
			'scope':'',
			'app_name': "RSS高级同步"
	});
function get_user_id(){
	var url = 'http://api.t.sina.com.cn/users/show.json';
	var uid=oauth.getUserId();
	var request = {
		'method': 'post',
		'parameters':{
			'user_id':uid
		}
	};
	oauth.sendSignedRequest(url,function(response){
		var json = eval("("+response+")");;
		document.getElementById("log_info").innerHTML = '已登入:<a href="http://t.sina.com.cn/'+json.id+'/profile" target="_blank">'+json.screen_name+'</a>.<a href="javascript:void(0)" onclick="logout()">退出</a>';
	}, request);
}
function login(){
	oauth.authorize(function(){
		get_user_id();
	});
	
	/*
	doesn't work
	chrome.extension.sendRequest({'hope':'set_login','login_status':1},function(response){
		oauth.authorize(function(){
			//rssinfo.logining = 0;
			chrome.extension.sendRequest({'hope':'set_login','login_status':0},function(response){
				get_user_id();
			});
		});
	});
	*/
}
function logout(){
	document.getElementById("log_info").innerHTML = '<a href="javascript:void(0);" onclick="login();">点击登录</a>';
	oauth.clearTokens();
}
function popup_onload(){
	document.getElementById("log_info").innerHTML = '正在获取登录数据...';
	setTimeout(function(){
		if(oauth.hasToken()){
			get_user_id();
		}else{
			document.getElementById("log_info").innerHTML = '<a href="javascript:void(0);" onclick="login()">点击登录</a>';
		}
	},100);	
	chrome.extension.sendRequest({'hope':'get_site_info'},function(response){
		document.getElementById("user_setting").innerHTML = '已登记'+ response.site.length +'个站点.'
		document.getElementById("user_setting").innerHTML += '<a href="./options.html" target="_blank">修改</a>';
	});
}

