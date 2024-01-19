import * as utils from './Utils';
import { useState } from 'react';
import { rDOM } from 'react-extensions-dom';
import { Transition, CSSTransition } from 'react-transition-group';
import { defaultStorageData } from './Main';
import './Form.css';

export function EditRuleForm({index, data, saveData, showState}){
	data={...{name:``,rules:[]},...data};
	const [ruleName, setRuleName]=useState(data.name);
	const [ruleContent, setRuleContent]=useState(JSON.stringify(data.rules, null, 4));
	const [editFormAnim, setEditFormAnim]=useState(true);

	function handleChangeName(e){
		setRuleName(e.target.value);
	}
	function handleChangeContent(e){
		setRuleContent(e.target.value);
	}

	function handleSave(){
		try{
			let tempRule=JSON.parse(ruleContent);
			if(!tempRule){
				alert(`规则数据为空，请重新输入！`);
				return;
			}
			if(tempRule && typeof saveData==`function`){
				saveData(`edit`,index,ruleName,tempRule);
				setEditFormAnim(false);
			}
		}catch(e){
			console.error(e);
			alert(`规则详情格式错误！错误码：${e}`);
		}
	}

	function handleCopy(){
		saveData(`copy`,index);
	}

	function handleCancel(){
		setEditFormAnim(false);
	}

	function applyRuleContent(model){
		try{
			let inputedContent=JSON.parse(ruleContent);
			switch(model){
				case `insert`:
					inputedContent.push({
						type:`insert`,
						location:`head`,
						pos:0,
						target:``,
					});
				break;
				case `replace`:
					inputedContent.push({
						type:`replace`,
						all:false,
						count:1,
						begin:1,
						origin:``,
						target:``,
					});
				break;
				case `replaceAll`:
					inputedContent.push({
						origin:``,
						target:``,
					});
				break;
				case `trim`:
					inputedContent.push({
						type:`trim`,
					});
				break;
				case `function`:
					inputedContent.push({
						type:`function`,
						function:`{}`,
					});
				break;
				case `@`:
					inputedContent.push({
						type:`@`,
					});
				break;
				case `condition`:
					inputedContent.push({
						if:``,
						type:`replace`,
						origin:``,
						target:``,
					});
				break;
				case `conditionBlock`:
					inputedContent.push({
						type:`condition`,
						if:``,
						rules:[
							{
								type:`replace`,
								origin:``,
								target:``,
							}
						],
					});
				break;
				case `whileBlock`:
					inputedContent.push({
						type:`condition`,
						while:``,
						rules:[
							{
								type:`replace`,
								origin:``,
								target:``,
							}
						],
					});
				break;
			}
			setRuleContent(JSON.stringify(inputedContent, undefined, 4));
		}catch(e){
			console.error(e);
			alert(`规则详情格式错误！错误码：${e}`);
		}
	}

	return rDOM({tag:CSSTransition,
		in:editFormAnim, timeout:250, classNames:`editFormBGAnim`,
		appear:true,
		onExited:()=>{
			if(typeof showState==`function`){
				showState(false);
			}
		},
		children:[
			{tag:`div`, id:`editForm`, className:`editForm editFormBGAnim`, children:[
				{tag:CSSTransition, in:editFormAnim, timeout:250, classNames:`editFormAnim`, appear:true, children:[
					{tag:`div`, id:`editWindow`, class:`editWindow editFormAnim`, children:[
						{tag:`div`,id:`editTitle`,class:`editTitle`, children:{
							tag:`button`, class:`editTitleBu`, html:`${index==undefined?`添加新规则`:`编辑规则【${data.name}】`}`
						}},
						{tag:`div`, id:`editContent`, className:`editContent`, children:[
							{tag:`table`, class:`editTable`, tr:[
								{td:[
									{className:`tableTitle`, html:`规则名称`},
									{className:`tableContent`, children:[
										{tag:`input`, id:`ruleName`, className:`ruleName`, value:ruleName, onChange:(e)=>handleChangeName(e)},
									]},
								]},
								{style:{height:`auto`},td:[
									{className:`tableTitle`, html:`规则详情`},
									{className:`tableContent`, style:{verticalAlign:`top`}, children:[
										{tag:`textarea`, id:`ruleContent`, className:`ruleContent`, value:ruleContent, onChange:(e)=>handleChangeContent(e)},
									]},
								]},
							]},
							{tag:`div`,id:`contentCtrl`,class:`contentCtrl`,children:[
								{tag:`button`,id:`contentFormatBu`, class:`contentFormatBu contentCtrlBu lighting`,html:`格式化`, onClick:()=>applyRuleContent()},
								{tag:`button`,id:`contentInsertBu`, class:`contentInsertBu contentCtrlBu`,html:`插入`, onClick:()=>applyRuleContent(`insert`)},
								{tag:`button`,id:`contentReplaceBu`,class:`contentReplaceBu contentCtrlBu`,html:`单替`, onClick:()=>applyRuleContent(`replace`)},
								{tag:`button`,id:`contentReplaceBu`,class:`contentReplaceBu contentCtrlBu`,html:`全替`, onClick:()=>applyRuleContent(`replaceAll`)},
								{tag:`button`,id:`contentTrimBu`,   class:`contentTrimBu contentCtrlBu`,html:`TRIM`, onClick:()=>applyRuleContent(`trim`)},
								{tag:`button`,id:`contentAtBu`,     class:`contentAtBu contentCtrlBu`,html:`@引用`, onClick:()=>applyRuleContent(`@`)},
								{tag:`button`,id:`contentConditionBu`,class:`contentConditionBu contentCtrlBu`,html:`判断`, onClick:()=>applyRuleContent(`condition`)},
								{tag:`button`,id:`contentConditionBlockBu`,class:`contentConditionBlockBu contentCtrlBu`,html:`判断块`, onClick:()=>applyRuleContent(`conditionBlock`)},
								{tag:`button`,id:`contentWhileBlockBu`,class:`contentWhileBlockBu contentCtrlBu`,html:`循环块`, onClick:()=>applyRuleContent(`whileBlock`)},
								{tag:`button`,id:`contentFunctionBu`,class:`contentFunctionBu contentCtrlBu`,html:`循环块`, onClick:()=>applyRuleContent(`function`)},
							]},
						]},
						{tag:`div`, id:`editCtrl`, className:`editCtrl`, children:[
							{tag:`button`, id:`editSaveBu`, className:`editSaveBu default`, html:`应用`, onClick:handleSave},
							(index!=undefined && ` `),
							(index!=undefined && {tag:`button`, id:`editCopyBu`, className:`editCopyBu lighting`, html:`复制`, onClick:handleCopy}),
							` `,
							{tag:`button`, id:`editCancelBu`, className:`editSaveBu`, html:`取消`, onClick:handleCancel},
						]},
					]}
				]}
			]}
		]
	});
}

export function SaveRuleForm({data, saveData, showState}){
	const [ruleJson, setRuleJson]=useState(JSON.stringify(data, null, 4));
	const [saveFormAnim, setSaveFormAnim]=useState(true);

	function handleChange(e){
		setRuleJson(e.target.value);
	}

	function handleSave(){
		let tempRule=utils.checkJson(ruleJson, defaultStorageData);
		if(tempRule && typeof saveData==`function`){
			saveData(tempRule);
			setSaveFormAnim(false);
		}
	}

	function handleCancel(){
		setSaveFormAnim(false);
	}

	return rDOM({tag:CSSTransition, 
		in:saveFormAnim, timeout:250, classNames:`editFormBGAnim`,
		appear:true,
		onExited:()=>{
			if(typeof showState==`function`){
				showState(false);
			}
		},
		children:[
			{tag:`div`, id:`editForm`, className:`editForm editFormBGAnim`, children:[
				{tag:CSSTransition, in:saveFormAnim, timeout:250, classNames:`editFormAnim`, appear:true, children:[
					{tag:`div`, id:`editWindow`, class:`editWindow editFormAnim`, children:[
						{tag:`div`, id:`editTitle`, className:`editTitle`, children:{tag:`button`, className:`editTitleBu`, html:`规则数据`}},
						{tag:`div`, id:`editContent`, className:`editContent`, children:[
							{tag:`table`, class:`editTable`, tbody:[
								{td:[
									{className:`tableContent`, style:{textAlign:`center`}, children:{
										tag:`textarea`, id:`ruleSaveContent`, className:`ruleContent ruleSaveContent`, value:ruleJson, onChange:(e)=>handleChange(e),
									}},
								]}
							]}
						]},
						{tag:`div`, id:`editCtrl`, className:`editCtrl`, children:[
							{tag:`button`, id:`editSaveBu`, className:`editSaveBu default`, html:`应用`, onClick:handleSave},
							` `,
							{tag:`button`, id:`editCancelBu`, className:`editSaveBu`, html:`取消`, onClick:handleCancel},
						]},
					]}
				]}
			]}
		]
	});
}