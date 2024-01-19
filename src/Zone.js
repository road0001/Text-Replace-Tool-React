import * as utils from './Utils';
import { rDOM } from 'react-extensions-dom';
import { ReactSortable } from 'react-sortablejs';
import './Zone.css';

export function RuleListZone({list, setList, selected, changeClick, editClick, delClick}){
	return rDOM({tag:`div`, className:`replaceRuleList`, children:[
		{tag:ReactSortable, tagName:`ul`, id:`replaceRuleList`, list:list, setList:setList, animation:300, children:list.map((rule, index)=>(
			// {tag:RuleListLi, key:rule.id, index:index, name:rule.name, selected:ruleSelected}
			{
				tag:`li`, id:`replaceRuleLi_${index}`, class:`replaceRuleLi`, key:rule.id, index:index, children:[
					{tag:`div`, id:`replaceRuleDiv_${index}`, className:`replaceRuleDiv`, children:[
						{tag:`button`, id:`replaceRuleBu_${index}`,className: {replaceRuleBu:true, selected:selected==index}, html:rule.name, onClick:()=>changeClick(index)},
						{tag:`button`, id:`replaceRuleEditBu_${index}`, className:`replaceRuleEditBu replaceRuleCtrlBu`, onClick:()=>editClick(index)},
						{tag:`button`, id:`replaceRuleDelBu_${index}`, className:`replaceRuleDelBu replaceRuleCtrlBu`, onClick:()=>delClick(index)},
					]}
				]
			}
		))},
	]});
}

export function TextZone({type, lineCount, text, textChange, clearClick}){
	let zoneTitle, typeForId=type.firstUpperCase(), ctrlBuList;
	switch(type){
		case `origin`:
			zoneTitle=`原始文本`;
			ctrlBuList=[
				{tag:`button`, id:`textOriginCopyBu`, class:`textOriginCopyBu ctrlBu lighting`, html:`▲复制原文▲`, onClick:()=>utils.copyContent(`textOriginInput`)},
				` `,
				{tag:`button`, id:`textReplaceCopyBu2`, class:`textReplaceCopyBu ctrlBu default`, html:`▼复制替换▼`, onClick:()=>utils.copyContent(`textReplaceInput`)},
				` `,
				{tag:`button`, id:`textOriginClearBu`, class:`textOriginClearBu ctrlBu`, html:`清空`, onClick:clearClick},
			]
		break;
		case `replace`:
			zoneTitle=`替换文本`;
			ctrlBuList=[
				{tag:`button`, id:`textReplaceCopyBu`, className:`textReplaceCopyBu ctrlBu default`, html:`▲复制替换▲`, onClick:()=>utils.copyContent(`textReplaceInput`)},
			]
		break;
	}
	return rDOM({tag:`div`, id:`text${typeForId}Zone`, className:`text${typeForId}Zone`, html:`${zoneTitle} `, children:[
		{tag:`span`, id:`${type}LineCount`, className:`${type}LineCount`, html:lineCount},
		{tag:`textarea`, id:`text${typeForId}Input`, className:`text${typeForId}Input textInput`, value:text, onChange:(e)=>type==`origin`?textChange(e):null},
		{tag:`div`, className:`text${typeForId}Ctrl ctrlZone`, children:ctrlBuList},
	]});
}