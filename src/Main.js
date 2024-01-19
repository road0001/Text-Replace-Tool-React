import { useState } from 'react';
import { rDOM } from 'react-extensions-dom';
import * as utils from './Utils';
import './Main.css';
import { Transition, CSSTransition } from 'react-transition-group';
import { RuleListZone, TextZone } from './Zone';
import { EditRuleForm, SaveRuleForm } from './Form';

let defaultStorageData={
	replaceRuleList:[],
	currentSelectRule:-1,
	originText:``,
}
let storageData={}
let storageRuleMap=new Map();

export {defaultStorageData, storageData, storageRuleMap};



let whileMaxCount=9999;
function applyRules(makeText, rules, extend={}){
	extend={
		...extend,
		...{replace:makeText},
	}
	//rules必须为数组
	for(let i=0; i<rules.length; i++){
		let curRule=rules[i];
		if(curRule.if==undefined || (typeof curRule.if==`string` && conditionJudge(curRule.if,makeText,undefined,extend))){
			//条件判断if字段，如果无此字段，或此字段为字符串、执行条件判断函数并返回结果为true时，才会执行下面的操作。
			let curRuleType=curRule.type;
			if(curRuleType==undefined && typeof curRule.origin==`string` && typeof curRule.target==`string`){
				//type: `replace`省略时，默认执行replace替换。必须同时存在origin和target两个字段才可满足。
				curRuleType=`replace`;
			}

			switch(true){
				case curRuleType[0]==`@`:
					makeText=applyRules(makeText,storageRuleMap.get(curRuleType.slice(1)),extend);
				break;

				case curRuleType==`condition`:
					if(typeof curRule.if==`string` && conditionJudge(curRule.if,makeText,undefined,extend)){
						makeText=applyRules(makeText,curRule.rules,extend); //块级条件判断直接将rules交给applyRules进行递归操作，完成后返回。通过此方法，可实现多层块级行为。
					}else if(typeof curRule.while==`string`){
						let _maxCount=0;
						while(conditionJudge(curRule.while,makeText,_maxCount,extend)){
							makeText=applyRules(makeText,curRule.rules,extend);
							_maxCount++;
							if(_maxCount>whileMaxCount){ //加入最大循环执行次数，防止死循环
								break;
							}
						}
					}
				break;

				case curRuleType==`insert`:
					switch(curRule.location){
						case `head`:
							makeText=makeText.slice(0,curRule.pos || 0)+curRule.target+makeText.slice(curRule.pos || 0);
						break;
						case `tail`: default:
							makeText=makeText.slice(0,makeText.length-(curRule.pos || 0))+curRule.target+makeText.slice(makeText.length-(curRule.pos || 0));
						break;
					}
				break;

				case curRuleType==`replace`:
					if(curRule.origin.includes(`||`)){
						let originSplit=curRule.origin.split(`||`);
						let oRuleList=[];
						for(let o of originSplit){
							let oRule=utils.cloneObject(curRule);
							oRule.origin=o;
							oRuleList.push(oRule);
						}
						makeText=applyRules(makeText,oRuleList,extend);
					}else{
						if(curRule.all==undefined || curRule.all==true){
							makeText=makeText.replaceAll(curRule.origin,curRule.target);
						}else{
							if(!isNaN(curRule.count)){
								let curRuleBegin=isNaN(curRule.begin)?0:curRule.begin-1; //此处c从0开始，但begin从第1次开始，因此-1
								if(curRuleBegin<0)curRuleBegin=0;
								for(let c=0; c<curRule.count+curRuleBegin; c++){
									if(c>=curRuleBegin){
										makeText=makeText.replace(curRule.origin,`%%MAKE_TEXT_TARGET_TEMP%%`);
									}else{
										makeText=makeText.replace(curRule.origin,`%%MAKE_TEXT_ORIGIN_TEMP%%`);
									}
								}
								//由于replace每次都是从开头查找并替换的，如果target中包含origin，那么就会出现重复替换的现象。
								//因此采用先按照规则将origin、target替换成临时字符串，处理完后再统一将此字符串分别替换。
								makeText=makeText.replaceAll(`%%MAKE_TEXT_ORIGIN_TEMP%%`, curRule.origin);
								makeText=makeText.replaceAll(`%%MAKE_TEXT_TARGET_TEMP%%`, curRule.target);
							}else{
								makeText=makeText.replace(curRule.origin,curRule.target);
							}
						}
					}
				break;

				case curRuleType==`function`:
					if(typeof curRule.function==`string`){
						makeText=execFunction(makeText,curRule.function,extend);
					}
				break;

				
				case curRuleType==`trim`:
					makeText=makeText.trim();
				break;
			}
		}
	}
	return makeText;
}

function conditionJudge(condition,itext,count,extend){
	let text,origin,target,replace;
	text=origin=itext;
	target=replace=(extend && extend.replace)?extend.replace:``;
	try{
		return eval(condition);
	}catch(e){
		console.error(e);
	}
}

function execFunction(itext,func,extend){
	let text,origin,target,replace;
	text=origin=itext;
	target=replace=(extend.replace)?extend.replace:``;
	try{
		return eval(func);
	}catch(e){
		console.error(e);
	}
}

function applyReplaceText(origin, selected){
	let makeText=origin;
	if(selected>=0){
		let curSelectedRule=storageData.replaceRuleList[selected];
		if(typeof curSelectedRule.rules==`object` && !isNaN(curSelectedRule.rules.length)){
			makeText=applyRules(makeText,curSelectedRule.rules,{origin:origin, replace:makeText});
		}
	}
	let originTextSplit=origin.split(`\n`);
	let replaceTextSplit=makeText.split(`\n`);

	return {
		originText:origin, replaceText:makeText,
		originLineCount:originTextSplit.length,
		replaceLineCount:replaceTextSplit.length,
	};
}

function applyRuleList(){
	storageRuleMap=new Map();
	for(let i=0; i<storageData.replaceRuleList.length; i++){
		let curRule=storageData.replaceRuleList[i];
		storageRuleMap.set(curRule.name, curRule.rules);
	}
}

storageData={
	...defaultStorageData,
	...utils.loadStorageData(),
};
utils.saveStorageData(storageData);

function Main() {
	// function applyStorageData(){
	// 	// applyRuleList();
	// 	applyRuleList();
	// 	applyOriginText();
	// 	applyReplaceText();
	// }

	
	// applyStorageData();
	applyRuleList();

	const [ruleData, setRuleData]=useState({
		originText:storageData.originText,
		ruleList:storageData.replaceRuleList,
		ruleSelected:storageData.currentSelectRule,
	});
	const [textAnim, setTextAnim]=useState(true);
	const [showSaveForm, setShowSaveForm]=useState(false);
	const [showEditForm, setShowEditForm]=useState(false);
	const [editData, setEditData]=useState({index:null, content:null});

	let replaceData=applyReplaceText(ruleData.originText, ruleData.ruleSelected);

	function handleChangeText(e){
		storageData.originText=e.target.value;
		refreshRuleList();
		// utils.saveStorageData(storageData);
		// setOriginText(storageData.originText);
	}

	function handleClearText(){
		if(window.confirm(`确定清空全部内容？`)){
			storageData.originText=``;
			refreshRuleList();
			// utils.saveStorageData(storageData);
			// setOriginText(storageData.originText);
		}
	}

	function changeRule(index){
		setTextAnim(false);
		console.log(`ChangeRule: ${index}`);
		storageData.currentSelectRule=index;
		// refreshRuleList(); 刷新交给动画的回调
	}

	function addRule(){
		setEditData({index:null, content:null});
		setShowEditForm(true);
	}

	function editRule(index){
		console.log(index);
		setEditData({index:index, content:storageData.replaceRuleList[index]});
		setShowEditForm(true);
	}

	function delRule(index){
		if(window.confirm(`确定删除规则【${storageData.replaceRuleList[index].name}】？`)){
			storageData.replaceRuleList.splice(index,1);
			if(storageData.currentSelectRule>storageData.replaceRuleList.length-1){
				storageData.currentSelectRule=storageData.replaceRuleList.length-1;
			}
			refreshRuleList();
		}
	}

	function refreshRuleList(){
		utils.saveStorageData(storageData);
		setRuleData({
			...ruleData,
			...{
				originText:storageData.originText,
				ruleList:storageData.replaceRuleList,
				ruleSelected:storageData.currentSelectRule,
			}
		});
	}

	function setSortedRuleList(s){
		storageData.replaceRuleList=s;
		refreshRuleList();
	}

	function saveEditData(type,index,name,data){
		console.log(type, index, data);
		switch(type){
			case `edit`:
				if(index==null){
					storageData.replaceRuleList.unshift({name:name,rules:data});
				}else{
					storageData.replaceRuleList[index]={name:name,rules:data};
				}
			break;
			case `copy`:
				let curRule=utils.cloneObject(storageData.replaceRuleList[index]);
				storageData.replaceRuleList.splice(index+1,0,curRule);
			break;
		}
		refreshRuleList();
	}

	function saveRuleData(data){
		console.log(data);
		storageData=data;
		refreshRuleList();
	}

	return (rDOM([
		{tag:`button`, id:`replaceRuleBu_add`,  className:`replaceRuleBu replaceAddBu`, html:`+`, onClick:()=>addRule()},
		{tag:`button`, id:`replaceRuleBu_save`, className:`replaceRuleBu replaceAddBu replaceSaveBu`, html:`+`, onClick:()=>setShowSaveForm(true)},
		{tag:RuleListZone, list:ruleData.ruleList, setList:(s)=>setSortedRuleList(s), selected:ruleData.ruleSelected, changeClick:(i)=>changeRule(i), editClick:(i)=>editRule(i), delClick:(i)=>delRule(i)},
		{tag:`div`, id:`textZone`, className:`textZone`, children:[
			{tag:CSSTransition, 
				in:textAnim, timeout:125, classNames:`textZoneAnim`, 
				onExited:()=>setTextAnim(true), 
				onEnter:()=>refreshRuleList(), 
				children:[
					{tag:`div`, className:`textDisplayZone textZoneAnim`, children:[
						{tag:TextZone, type:`origin`, lineCount:replaceData.originLineCount, text:ruleData.originText, textChange:(e)=>handleChangeText(e), clearClick:handleClearText},
						{tag:TextZone, type:`replace`,lineCount:replaceData.replaceLineCount,text:replaceData.replaceText},
					]}
				]
			}
		]},
		(showEditForm && {tag:EditRuleForm, index:editData.index, data:editData.content, saveData:saveEditData, showState:(b)=>setShowEditForm(b)}),
		(showSaveForm && {tag:SaveRuleForm, data:storageData, saveData:saveRuleData, showState:(b)=>setShowSaveForm(b)}),
	]));
}

export default Main;
