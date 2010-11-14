var oauth=ChromeExOAuth.initBackgroundPage({
	'request_url': "http://api.t.sina.com.cn/oauth/request_token",
	'authorize_url': "http://api.t.sina.com.cn/oauth/authorize",
	'access_url': "http://api.t.sina.com.cn/oauth/access_token",
	'consumer_key':"1242839386",
	'consumer_secret': "b1f1dcb9134cd3ab57d1914116301471",
	'scope':'',
	'app_name': "RSS高级同步"
});	
/*	
if unsigned
function updateBadgeText(str){ 
	chrome.browserAction.setBadgeBackgroundColor({"color":[11,173,46,190]});
	chrome.browserAction.setBadgeText({"text":str});
} 
*/	
var b = setInterval(function(){
	var i = 0;
	console.log("downloading...");
	for ( i = 0;i < rssinfo.site.length;i++)
	{
		rssinfo.site[i].download();
	}
	rssinfo.saveToLocalstorage();
	console.log("pending...");
},120000);//2 minute

var s = setInterval(function(){
	var i = 0;
	console.log("working...");
	for ( i = 0;i < rssinfo.site.length;i++)
	{
		rssinfo.site[i].send();
	}
	rssinfo.saveToLocalstorage();
	console.log("pending...");
},210000);//3.5 minute


function onBackgroundLoad(){ 	
	rssinfo.getFromLocalstorage();			
}
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
	var temp;
	switch (request.hope)
	{
	case "add_new_feed":
		temp = rssinfo.site.length;
		rssinfo.site[temp] = new site_class(temp);
		rssinfo.site[temp].name = request.site.name;
		rssinfo.site[temp].url = request.site.url;
		rssinfo.site[temp].feedurl = request.site.feedurl;
		rssinfo.site[temp].setting = request.site.setting;
		//rssinfo.site[i].data = site[i].data;
		rssinfo.site[temp].refresh_time = 0;//site[i].refresh_time;
		rssinfo.site[temp].status = 0;//site[i].status;
		rssinfo.saveToLocalstorage();
		sendResponse({});
		break;
	case "get_site_info":
		sendResponse({'site':rssinfo.site});
		break;
	case "delete":
		rssinfo.site.splice(request.site.id,1);
		rssinfo.saveToLocalstorage();
		sendResponse({});
		break;
	case "set_login":
		rssinfo.logining = parseInt(request.login_status);
		break;
	}
  });

