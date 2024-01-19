export function saveStorageData(storageData){
	localStorage.setItem(`storageData`,JSON.stringify(storageData));
}
export function loadStorageData(){
	return JSON.parse(localStorage.getItem(`storageData`));
}

export function cloneObject(obj){
	return JSON.parse(JSON.stringify(obj));
}

export function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function checkJson(ruleJson, defaultData){
	let tempRule;
	try{
		tempRule={
			...defaultData || {},
			...eval(`(${ruleJson || `{}`})`),
		}
	}catch(e){
		console.error(e);
		alert(`规则数据格式错误！错误码：${e}`);
		return;
	}
	if(tempRule==undefined){
		alert(`规则数据为空，请重新输入！`);
		return;
	}
	return tempRule;
}

export function copyContent(id){
	let textarea=document.getElementById(id);
	textarea.select();
	document.execCommand(`Copy`);
}

String.prototype.replaceAll=function(org,tgt=``){
	return this.split(org).join(tgt);
}

String.prototype.count=function(str){
	return this.split(str).length-1;
}
String.prototype.firstUpperCase=function(){
	let str=this;
	return str.charAt(0).toUpperCase() + str.slice(1);
}