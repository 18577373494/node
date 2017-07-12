/*
Create by li on2017/7/10
*/
//模型类

var mongoose = require('mongoose');
var contentsSchema = require('../schemas/contents');
//模型类的创建以及暴露
//用于对用户的表结构数据操作
//这个Content就是schema里面的ref
module.exports = mongoose.model('Content',contentsSchema);