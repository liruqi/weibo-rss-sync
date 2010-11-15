/*************************************************************************
* Copyright (c) 2010 im007boy@gmail.com. All rights reserved.            *
* Use of this source code is governed by a BSD-style license that can be *
* found in the LICENSE file.                                             *
*************************************************************************/

rssinfo = {};
rssinfo.logining = 0;
rssinfo.site = [];
rssinfo.cache = [];
rssinfo.counter = {
	'items':0,
	'bytes':0
}
/***********
	rssinfo.site[0] = {
		'name':'QQ250',
		'url':'http://www.guao.hk/feed',
		'setting':'',
		'data':{
			'item_list':[]				'unpublished data
		},
		'refresh_time':0
		'status':0						'0 success 1 URL load error  2 send success but load error	3 loading 4 load success but pub fail		
	};
***********/	
function item_class(_link,_date,_title,_desc,_status,site_id){
	this.id = site_id;
	this.link = _link;
	this.date = _date;
	this.title = _title;
	this.desc = _desc;
	this.status = _status; //0 new 1 finish
	this.message = "";  
	this.send = function(){
		if (this.message == "")
			return;
		if(!oauth.hasToken()){
			;
		}else{
			//if (rssinfo.site[this.id].send_time <new Date(this.date).getTime())
				if (!rssinfo.ifItemPublished(this.status,this.link,this.date))
					send_text(this.message,this.id,this.date,this.link);
			//else
			//	this.status = 1;
		}
	}
	function send_text(text,site_id,date,link) {
		//doesn't support images 
		if (text == "")
			return;
		var url = 'http://api.t.sina.com.cn/statuses/update.json';
		var encode_test=encodeURIComponent(text);
		var request = {
		'method': 'post',
		'parameters':{
			'status':encode_test/*,
			'pic':"http://open.sinaimg.cn/wikipic/jieshao.png" not support images*/
			}
		};
		// Send: GET https://docs.google.com/feeds/default/private/full?alt=json
		oauth.sendSignedRequest(url, function(response){
			var r = eval('('+response+')');
			//callback function
			if (r.error){
				console.log(text.substr(0,5)+"Wa.",new Date(),'\n',r);
				if (r.error == "40025:Error: repeated weibo text!")//error_code
					this_item.status = 1;
				response_error_message('Send_Error',r.error_code,r.error,debug.get_str_length(text));	
			}else{
				//console.log(text.substr(0,5)+"Accepd.",new Date());
				//if (rssinfo.site[site_id].send_time <new Date(date).getTime())
				//	rssinfo.site[site_id].send_time = new Date(date).getTime()
				this_item.status = 1;
				rssinfo.counter.items++;
				rssinfo.counter.bytes+=debug.get_str_length(text);
				//response_error_message('Send_Success',0,0,debug.get_str_length(text));	
			}
			//add to cache list;
			if (this_item.status == 1)
			{
				rssinfo.cache.push({'link':link,'date':date});
				while (rssinfo.cache.length > 120)
					rssinfo.cache.splice(0,1);
				
				//save to localStorage
				rssinfo.saveCache();
			}
		}, request);
	};
	var this_item = this;
}
function site_class(site_id){
	this.id = site_id;
	this.name = 'QQ250';
	this.url = 'http://127.0.0.1/guan.xml';
	this.feedurl = 'http://127.0.0.1/guan.xml';
	this.setting = [];
	this.data = {
			'item_list':[]				//'unpublished data
		};
	this.refresh_time = 0;
	this.send_time = 0;
	this.status = 0;
	var this_site = this;
	function clear(){
		//delete published message
		var i = 0;
		var len = this_site.data.item_list.length;
		for (i = 0;i < len;i++)
		{
			if (rssinfo.ifItemPublished(this_site.data.item_list[i].status,this_site.data.item_list[i].link,this_site.data.item_list[i].date))
			{
				this_site.data.item_list.splice(i,1);
				i--;
				len--;
			}
		}
	}
	this.send = function(){
		// clear published message
		clear();
		//
		var i,len;
		if(!oauth.hasToken()){
			updateBadgeText('!');
			if(rssinfo.logining == 0 && confirm("是否登录以继续同步？点取消不再提示。")){
				//rssinfo.logining = 1;
				oauth.authorize(function(){
					updateBadgeText('');
					rssinfo.logining = 0;
					len = this_site.data.item_list.length;
					console.log("同步"+len+"条数据");
					for (i = 0;i < (len<3?len:3);i++)
						this_site.data.item_list[i].send();
				});	
			}else
				rssinfo.logining = 1 ;
		}else{
			updateBadgeText('');
			len = this_site.data.item_list.length;
			console.log("同步"+len+"条数据");
			for (i = 0;i < (len<3?len:3);i++)
				this_site.data.item_list[i].send();
		}
	}

	function if_item_exist(str,date){
		//if exist ,return 1;else return 0
		var t = 0;
		var len = this_site.data.item_list.length;
		for (t = 0;t < len;t++)
		{
			if (this_site.data.item_list[t].link == str && this_site.data.item_list[t].date == date)
			{
				return 1;
			}
		}
		return rssinfo.ifItemPublished(0,str,date);
		//return 0;
	}
	function get_clear_text(str){
		
		str = str.replace(/<.*?>/g,"").replace(/\n/g,' ').replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ").replace(/&#39;/g,"\'").replace(/&quot;/g,"\"");   	
		//
		return str.replace(/\s+/g," ");
	}
	function generator_message(){
		//status string
		var i = 0;
		//var this_site = site;//why ? please help me
		var len = this_site.data.item_list.length;
		for (i = 0;i < len;i++)
		{
			if (this_site.data.item_list[i].message != "")
				continue;
			/*******
			str = str.replace(/<.*?>/g,""); <*>
			str = str.replace(/\n/g,' ');   \n
			<img>?
			******/
			var str = "";
			var title = get_clear_text(this_site.data.item_list[i].title);
			var link = this_site.data.item_list[i].link;
			var desc = get_clear_text(this_site.data.item_list[i].desc);
			if (this_site.setting.length == 0)
				this_site.setting[0] =  "desc";
			do{
				str = "";
				for (var t = 0;t < this_site.setting.length;t++)
				{
					switch(this_site.setting[t])
					{
						case "title"://title
							str += title;
							break;
						case "link"://link
							str += link;
							break;
						case "desc":
							str += desc;
							break;
						default:
							str += this_site.setting[t].slice(4);
							break;
					}
					
				}
				if (str_length_limit(str))
				{
					if(desc != "")	
						desc = desc.slice(0,-1);
					else if (title != "")
						title = title.slice(0,-1);
					else if (link != "")
						link = "";
					else 
					{
						str = get_clear_text(this_site.data.item_list[i].title);
						str = str.substr(0,130);
						break;
					}	
				}
			}while(str_length_limit(str));
			this_site.data.item_list[i].message = str;
		}
	}
	this.download = function(){
		//download feed file from web 
		if (this.status == 3){
			//timeout warning
			if (localStorage["debug"] == "true")
				console.log(this.name + " already downloading."+new Date());
			response_error_message('Download_Time_Out',0,0,0);
			return;
		}
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			//console.log(this_site.feedurl,xhr.readyState);
			if (xhr.readyState == 4) {
				if (localStorage["debug"] == "true")
					console.log("Begin..."+this_site.name+new Date());
				//from Subscribe in Feed Reader
				var doc = xhr.responseXML;
				if (!doc) {
					this_site.status = 2;
					console.log(this_site.name + " Not a valid feed.");
					response_error_message('Feed_Format_Error',0,0,0);
					return;
				} 
				this_site.status = 5;
				var entries = doc.getElementsByTagName('entry');
				if (entries.length == 0)
					entries = doc.getElementsByTagName('item');
				
				var this_time = -1;
				for (i = 0; i < entries.length && i < 15; ++i) {
					var item = entries.item(i);
					/* Grab the pubDate for the feed item. */
					var itemDate = item.getElementsByTagName('pubDate')[0];
					if (itemDate)
					  itemDate = itemDate.textContent;
					else{
						itemDate = item.getElementsByTagName('updated')[0];
						if (itemDate)
						{
							itemDate = itemDate.textContent;
							if (itemDate.indexOf('T') > -1)
							{
								//2010-11-12T09:46:40-08:00
								itemDate = itemDate.slice(0,19)+" "+itemDate.slice(19);//insert ' 'before time-zone
							}
						}else{
							itemDate = "Unknown pubDate";
							continue;
						}
					}
					//repair letter
					//if (isNaN(new Date(itemDate).getTime()))
					//	continue;
					/* new item */
					//if (new Date(itemDate) <= new Date(this_site.refresh_time))
					//	break;
						
					if (new Date(itemDate) > this_time)
						this_time = new Date(itemDate).getTime();
						
					/* Grab the title for the feed item. */
					var itemTitle = item.getElementsByTagName('title')[0];
					if (itemTitle)
					  itemTitle = itemTitle.textContent;
					else
					  itemTitle = "Unknown title";

					var itemDesc = item.getElementsByTagName('description')[0];
					if (!itemDesc)
					  itemDesc = item.getElementsByTagName('summary')[0];
					if (!itemDesc)
					  itemDesc = item.getElementsByTagName('content')[0];
		
					if (itemDesc)
					  itemDesc = itemDesc.textContent;
					else
					  itemDesc = "";
					//delete html tag 
					itemDesc = get_clear_text(itemDesc);
					if (itemDesc.length > 360)
					  itemDesc = itemDesc.substring(0, 360);
					   
					/* Grab the link URL. */
					var link = item.getElementsByTagName('link');
					var itemLink = "";
					if (link.length > 0) {
					  itemLink = link[0].childNodes[0];
					  if (itemLink)
						itemLink = link[0].childNodes[0].nodeValue;
					  else
						itemLink = link[0].getAttribute('href');
					}
					if (!if_item_exist(itemLink,itemDate))//no repead message in the pending list and cache
						this_site.data.item_list.push(new item_class(itemLink,itemDate,itemTitle,itemDesc,0,this_site.id));
				}
				//
				//onready();
				this_site.status = 8;
				if (this_time != -1)
					this_site.refresh_time = this_time;
				delete xhr;
				if (localStorage["debug"] == "true")
					console.log("End..."+this_site.name+new Date())
				generator_message();
				
			}//End if
		}//End onreadystatechange function
		xhr.open("GET", this.feedurl, true);
		this.status = 3;
		xhr.send();
		
	}
	//var this_site = this;
	this.debug_makemessage = function(){
		generator_message();
	}
	this.debug_print = function(){
		var i =0;
		for (i = 0;i < this.data.item_list.length;i++)
			console.log(this.data.item_list[i].status,this.data.item_list[i].message);
	}
}
rssinfo.getFromLocalstorage = function(){
	/******************
	rssinfo.site[0] = {
		'name':'QQ250',
		'url':'http://127.0.0.1/guan.xml',
		'setting':[],
		'data':{
			'item_list':[]				//'unpublished data
		},
		'refresh_time':0,
		'status':0						//'0 success 1 URL load error	2 load success but pub fail	3 loading	
	};
	******************/
	var default_str = '[]';//null array
	var site = [];
	if (localStorage["user_setting"])
	{
		try{
			site = eval(localStorage["user_setting"]);
		}catch(e){
			site = [];
			localStorage["user_setting"] = '[]';
		}	
	}else{
		site = [];
		localStorage["user_setting"] = '[]';
	}
	var i = 0;
	for (i = 0;i < site.length;i++)
	{
		rssinfo.site[i] = new site_class(i);
		rssinfo.site[i].name = site[i].name;
		rssinfo.site[i].url = site[i].url;
		rssinfo.site[i].feedurl = site[i].feedurl;
		rssinfo.site[i].setting = site[i].setting;
		//rssinfo.site[i].data = site[i].data;
		rssinfo.site[i].refresh_time = 0;//site[i].refresh_time;
		rssinfo.site[i].status = 0;//site[i].status;
	}	
	//cache
	if (localStorage["user_cache"])
	{
		try{
			rssinfo.cache = eval(localStorage["user_cache"]);
		}catch(e){
			rssinfo.cache = [];
			localStorage["user_cache"] = '[]';
		}	
	}else{
		rssinfo.cache = [];
		localStorage["user_cache"] = '[]';
	}
	
}

rssinfo.saveCache = function(){
	var str = JSON.stringify(rssinfo.cache);
	localStorage["user_cache"] = str;
}

rssinfo.saveToLocalstorage = function(){
	var site = [];
	for (i = 0;i < rssinfo.site.length;i++)
	{
		site[i] = new site_class();
		site[i].name = rssinfo.site[i].name;
		site[i].url = rssinfo.site[i].url;
		site[i].feedurl = rssinfo.site[i].feedurl;
		site[i].setting = rssinfo.site[i].setting;
		//site[i].refresh_time = rssinfo.site[i].refresh_time;
		site[i].refresh_time = rssinfo.site[i].send_time;
		site[i].status = rssinfo.site[i].status;
	}	
	var str = JSON.stringify(site);
	localStorage["user_setting"] = str;
	
	rssinfo.saveCache();
}

rssinfo.ifItemPublished = function(status,link,date){
	var t = 0;
	var len = rssinfo.cache.length;
	if (status == 1)
	{
		//if in cache list
		var i = 0;
		for (i = 0;i < rssinfo.cache.length;i++)
			if (rssinfo.cache[i].link == link && rssinfo.cache[i].date == date)
				break;
				
		//add to cache list		
		if (i == rssinfo.cache.length)
			rssinfo.cache.push({'link':link,'date':date});
		while (rssinfo.cache.length > 120)
			rssinfo.cache.splice(0,1);
		rssinfo.saveCache();	
		return 1;
	}
	len = rssinfo.cache.length;
	for (t = 0;t < len;t++)
	{
		if (rssinfo.cache[t].link == link && rssinfo.cache[t].date == date)
		{
			return 1;
		}
	}
	return 0;
}
/*****************************************************/
function updateBadgeText(str){ 
	chrome.browserAction.setBadgeBackgroundColor({"color":[255,0,0,190]});
	chrome.browserAction.setBadgeText({"text":str});
} 
function str_length_limit(str){
	if (typeof str != "string")
		return 0;
	//urls length always 12 bytes;
	//from sina.com.cn
	var regexp = new RegExp("(http://)+(([-A-Za-z0-9]+(.[-A-Za-z0-9]+)*(.[-A-Za-z]{2,5}))|([0-9]{1,3}(.[0-9]{1,3}){3}))(:[0-9]*)?(/[-A-Za-z0-9_$.+!*(),;:@&=?/~#%]*)*", "gi");  
	var s1 = str.match(/[^\x00-\x80]/g);
	var len;
	if (s1 != null)
		len = s1.length;
	else
		len = 0;
	if( Math.ceil((str.length - len)/2) + len > 134) //149  will 40028 ...in log file 023
		return 1;
	else
		return 0;
}

/*****************************************************/
var debug = {};
debug.re = function(){
	console.log(rssinfo.site);
}
debug.recover = function(){
	var str = '[{"name":"QQ250","url":"http://127.0.0.1/guan.xml","feedurl":"http://127.0.0.1/guan.xml","setting":"","data":{"item_list":[]},"refresh_time":0,"status":0},{"name":"QQ250","url":"http://127.0.0.1/guao.xml","feedurl":"http://127.0.0.1/guao.xml","setting":"","data":{"item_list":[]},"refresh_time":0,"status":0}]';
	localStorage["user_setting"] = str;
}
debug.get_rate_limit_info = function(){
	var url = 'http://api.t.sina.com.cn/account/rate_limit_status.json';
	var request = {
	'method': 'get'
	};
	oauth.sendSignedRequest(url, function(response){
		//callback function
		console.log(eval('('+response+')'));
	}, request);
}
debug.send = function(site_id){
	rssinfo.site[site_id].download();
	rssinfo.site[site_id].generator_message();
	rssinfo.site[site_id].send();
}
debug.get_str_length = function(str){
	if (typeof str != "string")
		return 0;
	//urls length always 12 bytes;
	//from sina.com.cn
	var regexp = new RegExp("(http://)+(([-A-Za-z0-9]+(.[-A-Za-z0-9]+)*(.[-A-Za-z]{2,5}))|([0-9]{1,3}(.[0-9]{1,3}){3}))(:[0-9]*)?(/[-A-Za-z0-9_$.+!*(),;:@&=?/~#%]*)*", "gi");  
	var s1 = str.match(/[^\x00-\x80]/g);
	var len;
	if (s1 != null)
		len = s1.length;
	else
		len = 0;
	return Math.ceil((str.length - len)/2) + len;
}

//error analytics ,error_code only
function response_error_message(msg_status,error_code,error,str_len) {
    _gaq.push(['_trackEvent',msg_status,error_code, error, str_len]);
	if (localStorage["debug"] == "true")
		console.log(msg_status,error_code, error, str_len);
};
