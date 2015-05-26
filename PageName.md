#同步RSS到微博（目前支持新浪）

# 简介 #

网上能同步微博的服务相应较慢，自带的关联博客服务也不稳定，同时无法自由设置输出格式、设置多个RSS源等。

这个Chrome扩展可以添加多个RSS并自由的设置输出格式（是否包含链接、标题，在何处加入自定义数据等），并进行同步。比一般同步服务更快(3～5分钟一轮)。

指令包括
```
标题:[title] 
链接:[link] 
简介:[desc] 
自定义字符串:[msg:字符串] 
使用+号相连接。只能用一次。样例：
[desc]
[title]+[link]
[msg:快讯]+[title]+[desc]+[link]
```


# 安装 #

  * Chrome扩展中心(推荐)：https://chrome.google.com/extensions/detail/lbjoepelakaocfmgdmmngdgjighomafm
  * 直接下载：http://weibo-rss-sync.googlecode.com/svn/trunk/rss2weibo.crx

# 反馈 #
  * 给我发邮件 im007boy@gmail.com
  * 填写在线表单 http://sinaurl.cn/h66FcL