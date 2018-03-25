# SSRefresh ![version](https://img.shields.io/badge/version-0.0.1-green.svg) ![vue-version](https://img.shields.io/badge/vue-%5E2.5.0-brightgreen.svg)

> A Refresh Component of vue

![Warning](https://raw.githubusercontent.com/RichardSleet/Materials/master/SSComponent/FBIWarning.png)
**警告: 谨慎使用**
![Demo](https://raw.githubusercontent.com/RichardSleet/Materials/master/SSComponent/SSRefreshDemo.gif)

Prop  | 备注
------------- | -------------
onCritical( type )  | 当达到刷新的临界条件时, type=1时表示进入到刷新区域 , type=0时标识进入到非刷新局域
onRefresh( onEndRefresh )  | 当刷新时,调用onEndRefresh()终止刷新识图
hasContainer | 是否拥有包裹视窗默认 false
onRefreshViewChange(height) | 当视图被拖动的时候,反复触发返回刷新视图的height

## Feature 
- [x] 加入检测刷新改变的钩子函数
- [x] 加入反复触发的缩放值钩子函数
- [ ] 加入传入hascontiner 的非全屏方式