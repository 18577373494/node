/*
Create by li on2017/7/5
*/
var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');
//处理通用数据
var data;
router.use(function(req,res,next) {
	data = {
		userInfo:req.userInfo,
		categories:[],
	}
	Category.find().then(function(categories) {
		data.categories = categories;
		next();
	})
})
router.get('/',function(req,res,next) {
	data.category = req.query.category || '';
	data.count = 0;
	data.page = Number(req.query.page || 1);
	data.limit = 4;
	data.pages = 0;

	var where = {};
    if(data.category) {
    	where.category = data.category;
    }

	Content.where(where).count().then(function(count) {
		data.count = count;
	    // 计算总页数
	    data.pages = Math.ceil(data.count / data.limit);
	    // 规定页数的最大与最小值
	    data.page = Math.min(data.page, data.pages);
	    data.page = Math.max(data.page, 1);
	    var skip = (data.page - 1) * data.limit;
	   
	    return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({addTime: -1});
	}).then(function(contents) {
		data.contents = contents;
		// console.log(data)
		res.render('main/index',data);
	})
});
//阅读全文
router.get('/view',function(req,res) {
	// console.log(req.query.contentid)
	var contentId = req.query.contentid || '';
	Content.findOne({
		_id:contentId
	}).then(function(content) {
		data.content = content;
		//阅读数自增
		content.views++;
		content.save();
		res.render('main/view',data);
	})
})
module.exports = router;