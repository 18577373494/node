/*
Create by li on2017/7/10
*/
var mongoose = require('mongoose');

//用户的表结构
module.exports = new mongoose.Schema({
	//关联字段-内容分类id
	category:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'Category'
	},
	//内容title
	title:String,
	//用户
	user:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'User'
	},
	//添加事件
	addTime:{
		//类型
		type:Date,
		//引用-默认值
		default:new Date()
	},
	//阅读量
	views:{
		//类型
		type:Number,
		//引用-默认值
		default:0
	},
	//简介
	description:{
		type:String,
		default:''
	},
	//内容
	content:{
		type:String,
		default:''
	},
	comments:{
		type:Array,
		default:[]
	}
})