import { useState } from 'react';
import { rDOM } from 'react-extensions-dom';
import * as utils from './Utils';
import './Main.css';
import { ReactSortable } from 'react-sortablejs';

let defaultStorageData={
	replaceRuleList:[],
	currentSelectRule:-1,
	originText:``,
}
let replaceTypeList=[
	{name:`插入`,key:`insert`},
	{name:`替换`,key:`replace`},
]
let storageData={}
let storageRuleMap=new Map();

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

function applyReplaceText(){
	let makeText=storageData.originText;
	if(storageData.currentSelectRule>=0){
		let curSelectedRule=storageData.replaceRuleList[storageData.currentSelectRule];
		if(typeof curSelectedRule.rules==`object` && !isNaN(curSelectedRule.rules.length)){
			makeText=applyRules(makeText,curSelectedRule.rules,{origin:storageData.originText, replace:makeText});
		}
	}
	let originTextSplit=storageData.originText.split(`\n`);
	let replaceTextSplit=makeText.split(`\n`);

	return {
		originText:storageData.originText, replaceText:makeText,
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

function copyContent(id){
	let textarea=document.getElementById(id);
	textarea.select();
	document.execCommand(`Copy`);
}

function Main() {
	// function applyStorageData(){
	// 	// applyRuleList();
	// 	applyRuleList();
	// 	applyOriginText();
	// 	applyReplaceText();
	// }

	storageData={
		...defaultStorageData,
		...utils.loadStorageData(),
	};
	utils.saveStorageData(storageData);
	// applyStorageData();

	const [originText, setOriginText]=useState(storageData.originText);
	const [ruleList, setRuleList]=useState(storageData.replaceRuleList);
	const [ruleSelected, setRuleSelected]=useState(storageData.currentSelectRule);

	let replaceData=applyReplaceText(originText, ruleSelected);

	function handleChangeText(e){
		storageData.originText=e.target.value;
		utils.saveStorageData(storageData);
		setOriginText(storageData.originText);
	}

	function handleClearText(){
		if(window.confirm(`确定清空全部内容？`)){
			storageData.originText=``;
			utils.saveStorageData(storageData);
			setOriginText(storageData.originText);
		}
	}

	function changeRule(index){
		console.log(`ChangeRule: ${index}`);
		storageData.currentSelectRule=index;
		refreshRuleList()
	}

	function editRule(index){

	}

	function delRule(index){

	}

	function refreshRuleList(){
		utils.saveStorageData(storageData);
		setRuleList(storageData.replaceRuleList);
		setRuleSelected(storageData.currentSelectRule);
	}

	function RuleListLi({key,index,name,selected}){
		return rDOM({
			tag:`li`, id:`replaceRuleLi_${index}`, key:key, index:index, children:[
				{tag:`div`, id:`replaceRuleDiv_${index}`, className:`replaceRuleDiv`, children:[
					{tag:`button`, id:`replaceRuleBu_${index}`,className: {replaceRuleBu:true, selected:selected==index}, html:name, onClick:()=>changeRule(index)},
					{tag:`button`, id:`replaceRuleEditBu_${index}`, className:`replaceRuleEditBu replaceRuleCtrlBu`, onClick:()=>editRule(index)},
					{tag:`button`, id:`replaceRuleDelBu_${index}`, className:`replaceRuleDelBu replaceRuleCtrlBu`, onClick:()=>delRule(index)},
				]}
			]
		});
	}

	console.log(rDOM({tag:RuleListLi, key:111, index:222, name:333, selected:444}));

	return (rDOM([
		{tag:`button`, id:`replaceRuleBu_add`,  className:`replaceRuleBu replaceAddBu`, html:`+`},
		{tag:`button`, id:`replaceRuleBu_save`, className:`replaceRuleBu replaceAddBu replaceSaveBu`, html:`+`},
		{tag:`div`, className:`replaceRuleList`, children:[
			{tag:`ul`, tagName:`ul`, id:`replaceRuleList`, list:ruleList, setList:setRuleList, fallbackOnBody:true, children:ruleList.map((rule, index)=>(
				{tag:RuleListLi, key:rule.id, index:index, name:rule.name, selected:ruleSelected}
			))},
		]},
		{tag:`div`, id:`textZone`, className:`textZone`, children:[
			{tag:`div`, className:`textDisplayZone`, children:[
				{tag:`div`, id:`textOriginZone`, className:`textOriginZone`, html:`原始文本 `, children:[
					{tag:`span`, id:`originLineCount`, className:`originLineCount`, html:replaceData.originLineCount},
					{tag:`textarea`, id:`textOriginInput`, className:`textOriginInput textInput`, value:originText, onChange:(e)=>handleChangeText(e)},
					{tag:`div`, className:`textOriginCtrl ctrlZone`, children:[
						{tag:`button`, id:`textOriginCopyBu`, class:`textOriginCopyBu ctrlBu lighting`, html:`▲复制原文▲`, onClick:()=>copyContent(`textOriginInput`)},
						` `,
						{tag:`button`, id:`textReplaceCopyBu2`, class:`textReplaceCopyBu ctrlBu default`, html:`▼复制替换▼`, onClick:()=>copyContent(`textReplaceInput`)},
						` `,
						{tag:`button`, id:`textOriginClearBu`, class:`textOriginClearBu ctrlBu`, html:`清空`, onClick:handleClearText},
					]},
				]},
				{tag:`div`, id:`textReplaceZone`, className:`textReplaceZone`, html:`替换文本 `, children:[
					{tag:`span`, id:`replaceLineCount`, className:`replaceLineCount`, html:replaceData.replaceLineCount},
					{tag:`textarea`, id:`textReplaceInput`, className:`textReplaceInput textInput`, readOnly:true, value:replaceData.replaceText},
					{tag:`div`, className:`textReplaceCtrl ctrlZone`, children:[
						{tag:`button`, id:`textReplaceCopyBu`, className:`textReplaceCopyBu ctrlBu default`, html:`▲复制替换▲`, onClick:()=>copyContent(`textReplaceInput`)},
					]},
				]},
			]}
		]}
	]));
}

export default Main;
