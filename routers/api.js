/*
Create by li on2017/7/5
*/
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require('../models/Content');
//定义统一返回格式
//初始化
var responseData;
router.use(function(req,res,next) {
	responseData = {
		code: 0,
		message: ''
	}
	next();
})
/*
用户注册
注册逻辑
	1.用户名不能为空
	2.密码不能为空
	3.两次密码要一致
操作数据库
	1.用户名是否被注册
	2.
*/
router.post('/user/register',function(req,res,next) {
	// console.log(req.body);//post提交过来的数据
	var username = req.body.username;
	var password = req.body.password;
	var repassword = req.body.repassword;

	if(username == '' ) {
		responseData.code = 1;
		responseData.message = '用户名不能为空';
		//反馈给前端
		res.json(responseData);
		return;
	}
	if(password == '' || repassword == '') {
		responseData.code  = 2;
		responseData.message = '两次密码不能为空';
		res.json(responseData);
		return;
	}
	if(password != repassword ) {
		responseData.code  = 3;
		responseData.message = '两次密码不一致';
		res.json(responseData);
		return;
	}
	//查询数据库
	//引入前面定义好的模型
	User.findOne({
		username:username
	}).then(function(userInfo) {
		console.log(userInfo);
		if(userInfo) {
			responseData.code = 4;
			responseData.message = '用户名已存在';
			res.json(responseData);
			return;
		}
		//保存到数据库
		//#save 操作对象
		var user = new User({
			username:username,
			password:password
		});
		return user.save();
	}).then(function(newUserInfo) {
		//保存成功后
		console.log(newUserInfo);
		responseData.message = '注册成功';
		res.json(responseData);
	})
	
});

router.post('/user/login',function(req,res,next) {
	var username = req.body.username;
	var password = req.body.password;
	if(username == '' || password == '') {
		responseData.code = 1;
		responseData.message = '用户名或密码不能为空';
		res.json(responseData);
		return;
	}
	//查询数据库
	User.findOne({
		username:username,
		password:password
	}).then(function(userInfo) {
		if(!userInfo) {
			responseData.code = 2;
			responseData.message = '用户名或密码错误';
			res.json(responseData);
			return;
		}
		//用户名密码正确
		responseData.message = '登录成功';
		responseData.userInfo = {
			_id:userInfo._id,
			username:userInfo.username
		}
		//设置cookie,保存登录信息到浏览器
		//1->这里将用户信息保存到cookies
		//2->路由main.js
		//3->页面的index.html
		req.cookies.set('userInfo',JSON.stringify({
			_id:userInfo._id,
			username:userInfo.username
		}));
		res.json(responseData);
		return;
	})
})

router.get('/user/logout',function(req,res) {
	//退出登录，清除cookies缓存
	req.cookies.set('userInfo',null);
	res.json(responseData);
})

//获取指定文章的所有评论
router.get('/comment',function (req,res)  {
	var contentId = req.query.contentid || '';
	Content.findOne({
		_id:contentId
	}).then(function(content) {
		responseData.message = '评论成功';
		responseData.data = content.comments;//返回给comment前端
		res.json(responseData);
	})

})
//评论提交
router.post('/comment/post',function(req,res) {
	// console.log(req.body);
	//内容的id
	var contentId = req.body.contentid || '';
	var postData = {
		username: req.userInfo.username,
		postTime:new Date(),
		content: req.body.content
	}
	//查询文章内容信息
	Content.findOne({
		_id:contentId
	}).then(function(content) {
		
		content.comments.push(postData);
		return content.save();
	}).then(function(newContent) {
		responseData.message = '评论成功';
		responseData.data = newContent;//返回给comment前端
		res.json(responseData);
	})
})

module.exports = router;