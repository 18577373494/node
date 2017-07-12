/*
Create by li on2017/7/5
*/
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function(req,res,next) {
	if(!req.userInfo.isAdmin) {
		res.send('对不起，只有管理员才能进入后台');
		return;
	}
	next();
});
//首页
router.get('/',function(req,res,next) {
	res.render('admin/index',{
		userInfo:req.userInfo
	});
})
// =====================用户============================
//用户管理
router.get('/user',function(req,res) {
	/*分页：
		1.limit(number)：限制显示条数
		2.skip(2) ：忽略的数据条数
		3.
	*/
	var page = Number(req.query.page || 1);//开始当前页
	var limit = 2;//每页显示的条数
	var pages = 0;
	//查询记录数
	User.count().then(function(count) {
		//总页数
		pages = Math.ceil(count/limit);
		//取值不能超过pages
		page = Math.min(page,pages);
		//取值不能小于1
		page = Math.max(page,1);

		var skip = (page-1)*limit;//跳过的条数

		//读数据库取用户信息//limit(3)限制显示条数
		User.find().limit(limit).skip(skip).then(function(users) {
		// console.log(users);
		res.render('admin/user_index',{
			userInfo:req.userInfo,
			users:users, 
			page:page,
			count:count,
			pages:pages,
			limit:limit
		});
	})
	
	});
})
// =====================分类============================
//分类管理里
//分类首页
router.get('/category',function(req,res) {
	var page = Number(req.query.page || 1);//开始当前页
	var limit = 4;//每页显示的条数
	var pages = 0;
	//查询记录数
	Category.count().then(function(count) {
		//总页数
		pages = Math.ceil(count/limit);
		//取值不能超过pages
		page = Math.min(page,pages);
		//取值不能小于1
		page = Math.max(page,1);

		var skip = (page-1)*limit;//跳过的条数

		//读数据库取用户信息//limit(3)限制显示条数
		/*
		sort({_id:})
		1:升
		-1：降
		*/
		Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories) {
		// console.log(users);
		res.render('admin/category_index',{
			userInfo:req.userInfo,
			categories:categories, 
			page:page,
			count:count,
			pages:pages,
			limit:limit
		});
	})
	
	});
})
//添加分类
router.get('/category/add',function(req,res) {
	res.render('admin/category_add',{
		userInfo:req.userInfo
	});
})
//添加分类
router.post('/category/add',function(req,res) {
	// console.log(req.body);//接收前台提交的数据
	var name = req.body.name || '';
	if(name == '') {
		// console.log('null')
		res.render('admin/error',{
			userInfo:res.userInfo,
			message:'名称不能为空'
		})
	}else{
		//判断数据库是否存在name
		Category.findOne({
			name:name
		}).then(function(rs) {
			//存在
			if(rs) {
				res.render('admin/error',{
					userInfo:res.userInfo,
					message:'分类已存在'
				})
				//不在走中间件
				return Promise.reject();
			}else{
				//保存到数据库
				return new Category({
					name:name
				}).save();
			}
		}).then(function(newCategory) {
			res.render('admin/success',{
				userInfo:res.userInfo,
				message:'分类保存成功',
				url:'/admin/category'
			});
		})
	}
})
//分类修改
router.get('/category/edit',function(req,res) {
	//获取分类信息
	var id = req.query.id || '';
	//查数据库获取修改信息
	Category.findOne({
		_id:id
	}).then(function(category) {
		if(category == null) {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在'
			})
		}else{
			res.render('admin/category_edit',{
				userInfo:req.userInfo,
				category:category
			})
		}
	})
})
//分类的修改保存
router.post('/category/edit',function(req,res) {
	//获取分类信息
	var id = req.query.id || '';
	//以post提交过来的name
	var name = req.body.name ||'';
	//查数据库获取修改信息
	Category.findOne({
		_id:id
	}).then(function(category) {
		if(category == null) {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在'
			})
		 return Promise.reject()
		}else{
			//当用户没有做修改
			if(name == category.name) {
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'名称没有做修改',
					url:'/admin/category'
				})
			return Promise.reject();
			}else{
				//要修改的名称在数据库中是否已存在
				return Category.findOne({
					_id:{$ne:id},
					name:name
				})
			}
		}
	}).then(function(sameCategoty) {
		if(sameCategoty) {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'数据库中已存在同名分类'
			})
		return Promise.reject();
		}else{
			// Category.update({条件},{值})
			return Category.update({
				_id:id
			},{
				name:name
			})
		}
	}).then(function() {
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'修改成功',
			url:'/admin/category'
		})
	})
})
//分类删除
router.get('/category/delete',function(req,res) {
	//获取分类信息
	var id = req.query.id || '';
	//查数据库获取修改信息
	Category.findOne({
		_id:id
	}).then(function(category) {
		if(category == null) {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在'
			})
		}else{
			Category.remove({
				_id:id
			}).then(function() {
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'删除成功',
					url:'/admin/category'
				})
			})
		}
	})
})
// =====================内容============================
//内容首页
router.get('/content',function(req,res) {
	var page = Number(req.query.page || 1);//开始当前页
	var limit = 4;//每页显示的条数
	var pages = 0;
	//查询记录数
	Content.count().then(function(count) {
		//总页数
		pages = Math.ceil(count/limit);
		//取值不能超过pages
		page = Math.min(page,pages);
		//取值不能小于1
		page = Math.max(page,1);

		var skip = (page-1)*limit;//跳过的条数
		//populate('category')关联的模型
		Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).sort({addTime: -1}).then(function(contents) {
			// console.log(contents)
		res.render('admin/content_index',{
			userInfo:req.userInfo,
			contents:contents, 
			page:page,
			count:count,
			pages:pages,
			limit:limit
		});
	})
	
	});
})
//内容首页添加
router.get('/content/add',function(req,res) {
	Category.find().sort({_id:-1}).then(function(categories) {
		res.render('admin/content_add',{
			userInfo:req.userInfo,
			categories:categories
		})
	})
	
})

//内容添加
router.post('/content/add',function(req,res) {
	// console.log(req.body)
	if(req.body.category == '') {
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'分类不能为空'
		})
		return;
	}
	if(req.body.title == '') {
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'标题不能为空'
		})
		return;
	}
	//保存到数据库
	new Content({
		category:req.body.category,
		title:req.body.title,
		user:req.userInfo._id.toString(),
		description:req.body.description,
		content:req.body.content
	}).save().then(function(re) {
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'内容保存成功',
			url:'/admin/content'

		})
	});
})
//内容修改
router.get('/content/edit',function(req,res) {
	var id = req.query.id || '';
	var categories = [];
	Category.find().sort({_id: -1}).then(function (rs) {
		categories = rs;
		return Content.findOne({
			_id:id
		}).populate('category');
	//populate('category');关联得模型
	}).then(function(content) {
		// console.log(content)
		if(!content) {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'内容不存在'
			})
			return Promise.reject();
		}else{
			res.render('admin/content_edit',{
				userInfo:req.userInfo,
				categories:categories,
				content:content
			})
		}
	})
	
})
//内容保存
router.post('/content/edit',function(req,res) {
	var id = req.query.id || '';
	if(req.body.category == '') {
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'分类不能为空'
		})
		return;
	}
	if(req.body.title == '') {
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'标题不能为空'
		})
		return;
	}
	//保存到数据库
	Content.update({
		_id:id
	},{
		category:req.body.category,
		title:req.body.title,
		description:req.body.description,
		content:req.body.content
	}).then(function() {
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'内容保存成功',
			url:'/admin/content/edit?id='+id
		})
	})
})
//内容的删除
router.get('/content/delete',function(req,res) {
	var id = req.query.id;
	//查数据库获取修改信息
	Content.findOne({
		_id:id
	}).then(function(category) {
		if(category == null) {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在'
			})
		}else{
			Content.remove({
				_id:id
			}).then(function() {
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'删除成功',
					url:'/admin/content'
				})
			})
		}
	})
})
module.exports = router;