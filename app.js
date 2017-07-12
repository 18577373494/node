/*
Create by li on2017/7/5
*/
//==========加载模块===============
var express = require('express');

//==========加载模板===============
var swig = require('swig'); 
//加载数据库
var mongoose = require('mongoose');
//加载body-parser用来处理post提交过来的数据
var bodyParser = require('body-parser');
//加载cookie
var Cookies = require('cookies');

var User = require('./models/User');

//创建APP应用 => nodejs http.cresteServer();
var app = express();

//设置静态文件托管
//当用户访问的URL以./public开始，那么直接返回对应的__dirname+'./public'下的文件
app.use('/public',express.static(__dirname+'/public'));


//定义模板引擎
//定义当前使用的模板引擎
//第一个参数：模板引擎名称，同时也是模板文件的后缀名
//第二个参数：用于解析处理模板内容的方法
app.engine('html',swig.renderFile);

//设置模板文件存放的目录
//第一个必须是views
//第二个参数必须是目录
app.set('views','./views');

//注册所使用的模板引擎，
//第一个参数必须是view engine 
//第二个参数必须和app.engine 这个方法中定义的模板引擎名称（第一个参数）是一致的
app.set('view engine','html');

//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

//body-parser配置
app.use(bodyParser.urlencoded({extended:true}));
//设置cookie
app.use(function(req,res,next) {
	req.cookies = new Cookies(req,res);

	//解析用户登录的cookie信息
	req.userInfo = {};
	if(req.cookies.get('userInfo')) {
		try{
			req.userInfo = JSON.parse(req.cookies.get('userInfo'));
			
			//获取当前登录用户的信息
			User.findById(req.userInfo._id).then(function(userInfo) {
				req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
				next();
			})
		}catch(e) {
			next();
		}
	}else{
		next();
	}
	
})

//根据不同的功能划分模块
//去到路由模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));


mongoose.connect('mongodb://wx.haili34.xyz:27018/blog',function(err) {
	if(err) {
		console.log('数据库了连接失败');
	}else{
		console.log('数据库了连接成功');
		app.listen(8888,'wx.haili34.xyz');
	}
})

//监听http请求
// app.listen(8888,'wx.haili34.xyz');
// console.log('listening...')