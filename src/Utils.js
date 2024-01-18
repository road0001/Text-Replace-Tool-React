export function saveStorageData(storageData){
	localStorage.setItem(`storageData`,JSON.stringify(storageData));
}
export function loadStorageData(){
	return JSON.parse(localStorage.getItem(`storageData`));
}

export function cloneObject(obj){
	return JSON.parse(JSON.stringify(obj));
}

String.prototype.replaceAll=function(org,tgt=``){
	return this.split(org).join(tgt);
}

String.prototype.count=function(str){
	return this.split(str).length-1;
}