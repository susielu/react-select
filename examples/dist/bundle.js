require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var React = require('react');
var classes = require('classnames');

var Option = React.createClass({
	displayName: 'Option',

	propTypes: {
		addLabelText: React.PropTypes.string, // string rendered in case of allowCreate option passed to ReactSelect
		className: React.PropTypes.string, // className (based on mouse position)
		mouseDown: React.PropTypes.func, // method to handle click on option element
		mouseEnter: React.PropTypes.func, // method to handle mouseEnter on option element
		mouseLeave: React.PropTypes.func, // method to handle mouseLeave on option element
		option: React.PropTypes.object.isRequired, // object that is base for that option
		renderFunc: React.PropTypes.func // method passed to ReactSelect component to render label text
	},

	blockEvent: function blockEvent(event) {
		event.preventDefault();
		if (event.target.tagName !== 'A' || !('href' in event.target)) {
			return;
		}

		if (event.target.target) {
			window.open(event.target.href);
		} else {
			window.location.href = event.target.href;
		}
	},

	render: function render() {
		var obj = this.props.option;
		var renderedLabel = this.props.renderFunc(obj);
		var optionClasses = classes(this.props.className, obj.className);

		return obj.disabled ? React.createElement(
			'div',
			{ className: optionClasses,
				onMouseDown: this.blockEvent,
				onClick: this.blockEvent },
			renderedLabel
		) : React.createElement(
			'div',
			{ className: optionClasses,
				style: obj.style,
				onMouseEnter: this.props.mouseEnter,
				onMouseLeave: this.props.mouseLeave,
				onMouseDown: this.props.mouseDown,
				onClick: this.props.mouseDown,
				title: obj.title },
			React.createElement(
				'span',
				null,
				obj.create ? this.props.addLabelText.replace('{label}', obj.label) : renderedLabel
			)
		);
	}
});

module.exports = Option;

},{"classnames":undefined,"react":undefined}],2:[function(require,module,exports){
'use strict';

var React = require('react');
var classes = require('classnames');

var SingleValue = React.createClass({
	displayName: 'SingleValue',

	propTypes: {
		placeholder: React.PropTypes.string, // this is default value provided by React-Select based component
		value: React.PropTypes.object // selected option
	},
	render: function render() {
		var classNames = classes('Select-placeholder', this.props.value && this.props.value.className);
		return React.createElement(
			'div',
			{
				className: classNames,
				style: this.props.value && this.props.value.style,
				title: this.props.value && this.props.value.title
			},
			this.props.placeholder
		);
	}
});

module.exports = SingleValue;

},{"classnames":undefined,"react":undefined}],3:[function(require,module,exports){
'use strict';

var React = require('react');
var classes = require('classnames');

var Value = React.createClass({

	displayName: 'Value',

	propTypes: {
		disabled: React.PropTypes.bool, // disabled prop passed to ReactSelect
		onOptionLabelClick: React.PropTypes.func, // method to handle click on value label
		onRemove: React.PropTypes.func, // method to handle remove of that value
		option: React.PropTypes.object.isRequired, // option passed to component
		optionLabelClick: React.PropTypes.bool, // indicates if onOptionLabelClick should be handled
		renderer: React.PropTypes.func // method to render option label passed to ReactSelect
	},

	blockEvent: function blockEvent(event) {
		event.stopPropagation();
	},

	handleOnRemove: function handleOnRemove(event) {
		if (!this.props.disabled) {
			this.props.onRemove(event);
		}
	},

	render: function render() {
		var label = this.props.option.label;
		if (this.props.renderer) {
			label = this.props.renderer(this.props.option);
		}

		if (!this.props.onRemove && !this.props.optionLabelClick) {
			return React.createElement(
				'div',
				{
					className: classes('Select-value', this.props.option.className),
					style: this.props.option.style,
					title: this.props.option.title
				},
				label
			);
		}

		if (this.props.optionLabelClick) {
			label = React.createElement(
				'a',
				{ className: classes('Select-item-label__a', this.props.option.className),
					onMouseDown: this.blockEvent,
					onTouchEnd: this.props.onOptionLabelClick,
					onClick: this.props.onOptionLabelClick,
					style: this.props.option.style,
					title: this.props.option.title },
				label
			);
		}

		return React.createElement(
			'div',
			{ className: classes('Select-item', this.props.option.className),
				style: this.props.option.style,
				title: this.props.option.title },
			React.createElement(
				'span',
				{ className: 'Select-item-icon',
					onMouseDown: this.blockEvent,
					onClick: this.handleOnRemove,
					onTouchEnd: this.handleOnRemove },
				'×'
			),
			React.createElement(
				'span',
				{ className: 'Select-item-label' },
				label
			)
		);
	}

});

module.exports = Value;

},{"classnames":undefined,"react":undefined}],"react-select":[function(require,module,exports){
/* disable some rules until we refactor more completely; fixing them now would
   cause conflicts with some open PRs unnecessarily. */
/* eslint react/jsx-sort-prop-types: 0, react/sort-comp: 0, react/prop-types: 0 */

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var ReactDOM = require('react-dom');
var Input = require('react-input-autosize');
var classes = require('classnames');
var Value = require('./Value');
var SingleValue = require('./SingleValue');
var Option = require('./Option');

var requestId = 0;

var Select = React.createClass({

	displayName: 'Select',

	propTypes: {
		addLabelText: React.PropTypes.string, // placeholder displayed when you want to add a label on a multi-value input
		allowCreate: React.PropTypes.bool, // whether to allow creation of new entries
		asyncOptions: React.PropTypes.func, // function to call to get options
		autoload: React.PropTypes.bool, // whether to auto-load the default async options set
		backspaceRemoves: React.PropTypes.bool, // whether backspace removes an item if there is no text input
		cacheAsyncResults: React.PropTypes.bool, // whether to allow cache
		className: React.PropTypes.string, // className for the outer element
		clearAllText: React.PropTypes.string, // title for the "clear" control when multi: true
		clearValueText: React.PropTypes.string, // title for the "clear" control
		clearable: React.PropTypes.bool, // should it be possible to reset value
		delimiter: React.PropTypes.string, // delimiter to use to join multiple values
		disabled: React.PropTypes.bool, // whether the Select is disabled or not
		filterOption: React.PropTypes.func, // method to filter a single option  (option, filterString)
		filterOptions: React.PropTypes.func, // method to filter the options array: function ([options], filterString, [values])
		ignoreCase: React.PropTypes.bool, // whether to perform case-insensitive filtering
		inputProps: React.PropTypes.object, // custom attributes for the Input (in the Select-control) e.g: {'data-foo': 'bar'}
		isLoading: React.PropTypes.bool, // whether the Select is loading externally or not (such as options being loaded)
		labelKey: React.PropTypes.string, // path of the label value in option objects
		matchPos: React.PropTypes.string, // (any|start) match the start or entire string when filtering
		matchProp: React.PropTypes.string, // (any|label|value) which option property to filter on
		multi: React.PropTypes.bool, // multi-value input
		multiSum: React.PropTypes.bool, // multiSum option enabler
		multiSumLimit: React.PropTypes.number, // limit for the number of options before it summarizes to x of y
		name: React.PropTypes.string, // field name, for hidden <input /> tag
		newOptionCreator: React.PropTypes.func, // factory to create new options when allowCreate set
		noResultsText: React.PropTypes.string, // placeholder displayed when there are no matching search results
		onBlur: React.PropTypes.func, // onBlur handler: function (event) {}
		onChange: React.PropTypes.func, // onChange handler: function (newValue) {}
		onFocus: React.PropTypes.func, // onFocus handler: function (event) {}
		onInputChange: React.PropTypes.func, // onInputChange handler: function (inputValue) {}
		onOptionLabelClick: React.PropTypes.func, // onCLick handler for value labels: function (value, event) {}
		optionComponent: React.PropTypes.func, // option component to render in dropdown
		optionRenderer: React.PropTypes.func, // optionRenderer: function (option) {}
		options: React.PropTypes.array, // array of options
		placeholder: React.PropTypes.string, // field placeholder, displayed when there's no value
		searchable: React.PropTypes.bool, // whether to enable searching feature or not
		searchingText: React.PropTypes.string, // message to display whilst options are loading via asyncOptions
		searchPromptText: React.PropTypes.string, // label to prompt for search input
		singleValueComponent: React.PropTypes.func, // single value component when multiple is set to false
		value: React.PropTypes.any, // initial field value
		valueComponent: React.PropTypes.func, // value component to render in multiple mode
		valueKey: React.PropTypes.string, // path of the label value in option objects
		valueRenderer: React.PropTypes.func // valueRenderer: function (option) {}
	},

	getDefaultProps: function getDefaultProps() {
		return {
			addLabelText: 'Add "{label}"?',
			allowCreate: false,
			asyncOptions: undefined,
			autoload: true,
			backspaceRemoves: true,
			cacheAsyncResults: true,
			className: undefined,
			clearAllText: 'Clear all',
			clearValueText: 'Clear value',
			clearable: true,
			delimiter: ',',
			disabled: false,
			ignoreCase: true,
			inputProps: {},
			isLoading: false,
			labelKey: 'label',
			matchPos: 'any',
			matchProp: 'any',
			multiSumLimit: 3,
			name: undefined,
			newOptionCreator: undefined,
			noResultsText: 'No results found',
			onChange: undefined,
			onInputChange: undefined,
			onOptionLabelClick: undefined,
			optionComponent: Option,
			options: undefined,
			placeholder: 'Select...',
			searchable: true,
			searchingText: 'Searching...',
			searchPromptText: 'Type to search',
			singleValueComponent: SingleValue,
			value: undefined,
			valueComponent: Value,
			valueKey: 'value'
		};
	},

	getInitialState: function getInitialState() {
		return {
			/*
    * set by getStateFromValue on componentWillMount:
    * - value
    * - values
    * - filteredOptions
    * - inputValue
    * - placeholder
    * - focusedOption
   */
			isFocused: false,
			isLoading: false,
			isOpen: false,
			options: this.props.options
		};
	},

	componentWillMount: function componentWillMount() {
		var _this = this;

		this._optionsCache = {};
		this._optionsFilterString = '';
		this._closeMenuIfClickedOutside = function (event) {
			if (!_this.state.isOpen) {
				return;
			}
			var menuElem = ReactDOM.findDOMNode(_this.refs.selectMenuContainer);
			var controlElem = ReactDOM.findDOMNode(_this.refs.control);

			var eventOccuredOutsideMenu = _this.clickedOutsideElement(menuElem, event);
			var eventOccuredOutsideControl = _this.clickedOutsideElement(controlElem, event);

			// Hide dropdown menu if click occurred outside of menu
			if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
				_this.setState({
					isOpen: false
				}, _this._unbindCloseMenuIfClickedOutside);
			}
		};
		this._bindCloseMenuIfClickedOutside = function () {
			if (!document.addEventListener && document.attachEvent) {
				document.attachEvent('onclick', _this._closeMenuIfClickedOutside);
			} else {
				document.addEventListener('click', _this._closeMenuIfClickedOutside);
			}
		};
		this._unbindCloseMenuIfClickedOutside = function () {
			if (!document.removeEventListener && document.detachEvent) {
				document.detachEvent('onclick', _this._closeMenuIfClickedOutside);
			} else {
				document.removeEventListener('click', _this._closeMenuIfClickedOutside);
			}
		};
		this.setState(this.getStateFromValue(this.props.value));
	},

	componentDidMount: function componentDidMount() {
		if (this.props.asyncOptions && this.props.autoload) {
			this.autoloadAsyncOptions();
		}
	},

	componentWillUnmount: function componentWillUnmount() {
		clearTimeout(this._blurTimeout);
		clearTimeout(this._focusTimeout);
		if (this.state.isOpen) {
			this._unbindCloseMenuIfClickedOutside();
		}
	},

	componentWillReceiveProps: function componentWillReceiveProps(newProps) {
		var _this2 = this;

		var optionsChanged = false;
		if (JSON.stringify(newProps.options) !== JSON.stringify(this.props.options)) {
			optionsChanged = true;
			this.setState({
				options: newProps.options,
				filteredOptions: this.filterOptions(newProps.options)
			});
		}
		if (newProps.value !== this.state.value || newProps.placeholder !== this.props.placeholder || optionsChanged) {
			var setState = function setState(newState) {
				_this2.setState(_this2.getStateFromValue(newProps.value, newState && newState.options || newProps.options, newProps.placeholder));
			};
			if (this.props.asyncOptions) {
				this.loadAsyncOptions(newProps.value, {}, setState);
			} else {
				setState();
			}
		}
	},

	componentDidUpdate: function componentDidUpdate() {
		var _this3 = this;

		if (!this.props.disabled && this._focusAfterUpdate) {
			clearTimeout(this._blurTimeout);
			clearTimeout(this._focusTimeout);
			this._focusTimeout = setTimeout(function () {
				if (!_this3.isMounted()) return;
				_this3.getInputNode().focus();
				_this3._focusAfterUpdate = false;
			}, 50);
		}
		if (this._focusedOptionReveal) {
			if (this.refs.focused && this.refs.menu) {
				var focusedDOM = ReactDOM.findDOMNode(this.refs.focused);
				var menuDOM = ReactDOM.findDOMNode(this.refs.menu);
				var focusedRect = focusedDOM.getBoundingClientRect();
				var menuRect = menuDOM.getBoundingClientRect();

				if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
					menuDOM.scrollTop = focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight;
				}
			}
			this._focusedOptionReveal = false;
		}
	},

	focus: function focus() {
		this.getInputNode().focus();
	},

	clickedOutsideElement: function clickedOutsideElement(element, event) {
		var eventTarget = event.target ? event.target : event.srcElement;
		while (eventTarget != null) {
			if (eventTarget === element) return false;
			eventTarget = eventTarget.offsetParent;
		}
		return true;
	},

	getStateFromValue: function getStateFromValue(value, options, placeholder) {
		var _this4 = this;

		if (!options) {
			options = this.state.options;
		}
		if (!placeholder) {
			placeholder = this.props.placeholder;
		}

		// reset internal filter string
		this._optionsFilterString = '';

		var values = this.initValuesArray(value, options);
		var filteredOptions = this.filterOptions(options, values);

		var focusedOption;
		var valueForState = null;
		if (!this.props.multi && values.length) {
			focusedOption = values[0];
			valueForState = values[0][this.props.valueKey];
		} else {
			focusedOption = this.getFirstFocusableOption(filteredOptions);
			valueForState = values.map(function (v) {
				return v[_this4.props.valueKey];
			}).join(this.props.delimiter);
		}

		return {
			value: valueForState,
			values: values,
			inputValue: '',
			filteredOptions: filteredOptions,
			placeholder: !this.props.multi && values.length ? values[0][this.props.labelKey] : placeholder,
			focusedOption: focusedOption
		};
	},

	getFirstFocusableOption: function getFirstFocusableOption(options) {

		for (var optionIndex = 0; optionIndex < options.length; ++optionIndex) {
			if (!options[optionIndex].disabled) {
				return options[optionIndex];
			}
		}
	},

	initValuesArray: function initValuesArray(values, options) {
		var _this5 = this;

		if (!Array.isArray(values)) {
			if (typeof values === 'string') {
				values = values === '' ? [] : this.props.multi ? values.split(this.props.delimiter) : [values];
			} else {
				values = values !== undefined && values !== null ? [values] : [];
			}
		}
		return values.map(function (val) {
			if (typeof val === 'string' || typeof val === 'number') {
				for (var key in options) {
					if (options.hasOwnProperty(key) && options[key] && (options[key][_this5.props.valueKey] === val || typeof options[key][_this5.props.valueKey] === 'number' && options[key][_this5.props.valueKey].toString() === val)) {
						return options[key];
					}
				}
				return { value: val, label: val };
			} else {
				return val;
			}
		});
	},

	setValue: function setValue(value, focusAfterUpdate) {
		if (focusAfterUpdate || focusAfterUpdate === undefined) {
			this._focusAfterUpdate = true;
		}
		var newState = this.getStateFromValue(value);
		newState.isOpen = false;
		this.fireChangeEvent(newState);
		this.setState(newState);
	},

	selectValue: function selectValue(value) {
		if (!this.props.multi) {
			this.setValue(value);
		} else if (value) {
			this.addValue(value);
		}
		this._unbindCloseMenuIfClickedOutside();
	},

	addValue: function addValue(value) {
		this.setValue(this.state.values.concat(value));
	},

	popValue: function popValue() {
		this.setValue(this.state.values.slice(0, this.state.values.length - 1));
	},

	removeValue: function removeValue(valueToRemove) {
		this.setValue(this.state.values.filter(function (value) {
			return value !== valueToRemove;
		}));
	},

	clearValue: function clearValue(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.setValue(null);
	},

	resetValue: function resetValue() {
		this.setValue(this.state.value === '' ? null : this.state.value);
	},

	getInputNode: function getInputNode() {
		var input = this.refs.input;
		return this.props.searchable ? input : ReactDOM.findDOMNode(input);
	},

	fireChangeEvent: function fireChangeEvent(newState) {
		if (newState.value !== this.state.value && this.props.onChange) {
			this.props.onChange(newState.value, newState.values);
		}
	},

	handleMouseDown: function handleMouseDown(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();

		// for the non-searchable select, close the dropdown when button is clicked
		if (this.state.isOpen && !this.props.searchable) {
			this.setState({
				isOpen: false
			}, this._unbindCloseMenuIfClickedOutside);
			return;
		}

		if (this.state.isFocused) {
			this.setState({
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			this._openAfterFocus = true;
			this.getInputNode().focus();
		}
	},

	handleMouseDownOnMenu: function handleMouseDownOnMenu(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
	},

	handleMouseDownOnArrow: function handleMouseDownOnArrow(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		// If not focused, handleMouseDown will handle it
		if (!this.state.isOpen) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.setState({
			isOpen: false
		}, this._unbindCloseMenuIfClickedOutside);
	},

	handleInputFocus: function handleInputFocus(event) {
		var _this6 = this;

		var newIsOpen = this.state.isOpen || this._openAfterFocus;
		this.setState({
			isFocused: true,
			isOpen: newIsOpen
		}, function () {
			if (newIsOpen) {
				_this6._bindCloseMenuIfClickedOutside();
			} else {
				_this6._unbindCloseMenuIfClickedOutside();
			}
		});
		this._openAfterFocus = false;
		if (this.props.onFocus) {
			this.props.onFocus(event);
		}
	},

	handleInputBlur: function handleInputBlur(event) {
		var _this7 = this;

		this._blurTimeout = setTimeout(function () {
			if (_this7._focusAfterUpdate || !_this7.isMounted()) return;
			_this7.setState({
				isFocused: false,
				isOpen: false
			});
		}, 50);
		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
	},

	handleKeyDown: function handleKeyDown(event) {
		if (this.props.disabled) return;
		switch (event.keyCode) {
			case 8:
				// backspace
				if (!this.state.inputValue && this.props.backspaceRemoves) {
					event.preventDefault();
					this.popValue();
				}
				return;
			case 9:
				// tab
				if (event.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
					return;
				}
				this.selectFocusedOption();
				break;
			case 13:
				// enter
				if (!this.state.isOpen) return;
				this.selectFocusedOption();
				break;
			case 27:
				// escape
				if (this.state.isOpen) {
					this.resetValue();
				} else if (this.props.clearable) {
					this.clearValue(event);
				}
				break;
			case 38:
				// up
				this.focusPreviousOption();
				break;
			case 40:
				// down
				this.focusNextOption();
				break;
			case 188:
				// ,
				if (this.props.allowCreate && this.props.multi) {
					event.preventDefault();
					event.stopPropagation();
					this.selectFocusedOption();
				} else {
					return;
				}
				break;
			default:
				return;
		}
		event.preventDefault();
	},

	// Ensures that the currently focused option is available in filteredOptions.
	// If not, returns the first available option.
	_getNewFocusedOption: function _getNewFocusedOption(filteredOptions) {
		for (var key in filteredOptions) {
			if (filteredOptions.hasOwnProperty(key) && filteredOptions[key] === this.state.focusedOption) {
				return filteredOptions[key];
			}
		}
		return this.getFirstFocusableOption(filteredOptions);
	},

	handleInputChange: function handleInputChange(event) {
		// assign an internal variable because we need to use
		// the latest value before setState() has completed.
		this._optionsFilterString = event.target.value;

		if (this.props.onInputChange) {
			this.props.onInputChange(event.target.value);
		}

		if (this.props.asyncOptions) {
			this.setState({
				isLoading: true,
				inputValue: event.target.value
			});
			this.loadAsyncOptions(event.target.value, {
				isLoading: false,
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			var filteredOptions = this.filterOptions(this.state.options);
			this.setState({
				isOpen: true,
				inputValue: event.target.value,
				filteredOptions: filteredOptions,
				focusedOption: this._getNewFocusedOption(filteredOptions)
			}, this._bindCloseMenuIfClickedOutside);
		}
	},

	autoloadAsyncOptions: function autoloadAsyncOptions() {
		var _this8 = this;

		this.setState({
			isLoading: true
		});
		this.loadAsyncOptions(this.props.value || '', { isLoading: false }, function () {
			// update with new options but don't focus
			_this8.setValue(_this8.props.value, false);
		});
	},

	loadAsyncOptions: function loadAsyncOptions(input, state, callback) {
		var _this9 = this;

		var thisRequestId = this._currentRequestId = requestId++;
		if (this.props.cacheAsyncResults) {
			for (var i = 0; i <= input.length; i++) {
				var cacheKey = input.slice(0, i);
				if (this._optionsCache[cacheKey] && (input === cacheKey || this._optionsCache[cacheKey].complete)) {
					var options = this._optionsCache[cacheKey].options;
					var filteredOptions = this.filterOptions(options);
					var newState = {
						options: options,
						filteredOptions: filteredOptions,
						focusedOption: this._getNewFocusedOption(filteredOptions)
					};
					for (var key in state) {
						if (state.hasOwnProperty(key)) {
							newState[key] = state[key];
						}
					}
					this.setState(newState);
					if (callback) callback.call(this, newState);
					return;
				}
			}
		}

		this.props.asyncOptions(input, function (err, data) {
			if (err) throw err;
			if (_this9.props.cacheAsyncResults) {
				_this9._optionsCache[input] = data;
			}
			if (thisRequestId !== _this9._currentRequestId) {
				return;
			}
			var filteredOptions = _this9.filterOptions(data.options);
			var newState = {
				options: data.options,
				filteredOptions: filteredOptions,
				focusedOption: _this9._getNewFocusedOption(filteredOptions)
			};
			for (var key in state) {
				if (state.hasOwnProperty(key)) {
					newState[key] = state[key];
				}
			}
			_this9.setState(newState);
			if (callback) {
				callback.call(_this9, newState);
			}
		});
	},

	filterOptions: function filterOptions(options, values) {
		var filterValue = this._optionsFilterString;
		var exclude = (values || this.state.values).map(function (i) {
			return i.value;
		});
		if (this.props.filterOptions) {
			return this.props.filterOptions.call(this, options, filterValue, exclude);
		} else {
			var filterOption = function filterOption(op) {
				if (this.props.multi && exclude.indexOf(op[this.props.valueKey]) > -1) return false;
				if (this.props.filterOption) return this.props.filterOption.call(this, op, filterValue);
				var valueTest = String(op[this.props.valueKey]);
				var labelTest = String(op[this.props.labelKey]);
				if (this.props.ignoreCase) {
					valueTest = valueTest.toLowerCase();
					labelTest = labelTest.toLowerCase();
					filterValue = filterValue.toLowerCase();
				}
				return !filterValue || this.props.matchPos === 'start' ? this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue || this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue : this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0 || this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0;
			};
			return (options || []).filter(filterOption, this);
		}
	},

	selectFocusedOption: function selectFocusedOption() {
		if (this.props.allowCreate && !this.state.focusedOption) {
			return this.selectValue(this.state.inputValue);
		}

		if (this.state.focusedOption) {
			return this.selectValue(this.state.focusedOption);
		}
	},

	focusOption: function focusOption(op) {
		this.setState({
			focusedOption: op
		});
	},

	focusNextOption: function focusNextOption() {
		this.focusAdjacentOption('next');
	},

	focusPreviousOption: function focusPreviousOption() {
		this.focusAdjacentOption('previous');
	},

	focusAdjacentOption: function focusAdjacentOption(dir) {
		this._focusedOptionReveal = true;

		var ops = this.state.filteredOptions.filter(function (op) {
			return !op.disabled;
		});

		if (!this.state.isOpen) {
			this.setState({
				isOpen: true,
				inputValue: '',
				focusedOption: this.state.focusedOption || ops[dir === 'next' ? 0 : ops.length - 1]
			}, this._bindCloseMenuIfClickedOutside);
			return;
		}
		if (!ops.length) {
			return;
		}
		var focusedIndex = -1;
		for (var i = 0; i < ops.length; i++) {
			if (this.state.focusedOption === ops[i]) {
				focusedIndex = i;
				break;
			}
		}
		var focusedOption = ops[0];
		if (dir === 'next' && focusedIndex > -1 && focusedIndex < ops.length - 1) {
			focusedOption = ops[focusedIndex + 1];
		} else if (dir === 'previous') {
			if (focusedIndex > 0) {
				focusedOption = ops[focusedIndex - 1];
			} else {
				focusedOption = ops[ops.length - 1];
			}
		}
		this.setState({
			focusedOption: focusedOption
		});
	},

	unfocusOption: function unfocusOption(op) {
		if (this.state.focusedOption === op) {
			this.setState({
				focusedOption: null
			});
		}
	},

	buildMenu: function buildMenu() {
		var focusedValue = this.state.focusedOption ? this.state.focusedOption[this.props.valueKey] : null;
		var renderLabel = this.props.optionRenderer || function (op) {
			return op.label;
		};

		if (this.state.filteredOptions.length > 0) {
			focusedValue = focusedValue == null ? this.state.filteredOptions[0] : focusedValue;
		}
		// Add the current value to the filtered options in last resort
		var options = this.state.filteredOptions;
		if (this.props.allowCreate && this.state.inputValue.trim()) {
			var inputValue = this.state.inputValue;
			options = options.slice();
			var newOption = this.props.newOptionCreator ? this.props.newOptionCreator(inputValue) : {
				value: inputValue,
				label: inputValue,
				create: true
			};
			options.unshift(newOption);
		}

		if (this.props.multi && this.props.multiSum) {
			options = options.map(function (opt) {
				opt.type = 'opt';
				opt.isMulti = false;
				opt.renderLabel = undefined;
				opt.selectValue = undefined;
				return opt;
			});

			if (this.state.values.length > 0) {
				var multiValues = this.state.values.map(function (val) {
					val.type = 'multiSum';
					val.isMulti = true;
					var optionRenderer = this.props.optionRenderer;
					val.renderLabel = function (op) {
						var label = op.label;
						if (optionRenderer) {
							label = optionRenderer(op);
						}
						return 'x ' + label;
					};

					val.selectValue = this.removeValue.bind(this, val);
					return val;
				}, this);

				options = multiValues.concat(options);
			}
		}

		var ops = options.map(function (op) {
			var isSelected = this.state.value === op.value;
			var isFocused = focusedValue === op.value;

			var optionClass = classes({
				'Select-option': true,
				'is-selected': isSelected,
				'is-focused': isFocused,
				'is-disabled': op.disabled,
				'is-multiSum': op.isMulti
			});
			var ref = isFocused ? 'focused' : null;
			var mouseEnter = this.focusOption.bind(this, op);
			var mouseLeave = this.unfocusOption.bind(this, op);
			var mouseDown = op.selectValue || this.selectValue.bind(this, op);
			var optionResult = React.createElement(this.props.optionComponent, {
				key: 'option-' + op[this.props.valueKey],
				className: optionClass,
				renderFunc: op.renderLabel || renderLabel,
				mouseEnter: mouseEnter,
				mouseLeave: mouseLeave,
				mouseDown: mouseDown,
				click: mouseDown,
				addLabelText: this.props.addLabelText,
				option: op,
				ref: ref
			});
			return optionResult;
		}, this);

		if (ops.length) {
			return ops;
		} else {
			var noResultsText, promptClass;
			if (this.isLoading()) {
				promptClass = 'Select-searching';
				noResultsText = this.props.searchingText;
			} else if (this.state.inputValue || !this.props.asyncOptions) {
				promptClass = 'Select-noresults';
				noResultsText = this.props.noResultsText;
			} else {
				promptClass = 'Select-search-prompt';
				noResultsText = this.props.searchPromptText;
			}

			return React.createElement(
				'div',
				{ className: promptClass },
				noResultsText
			);
		}
	},

	handleOptionLabelClick: function handleOptionLabelClick(value, event) {
		if (this.props.onOptionLabelClick) {
			this.props.onOptionLabelClick(value, event);
		}
	},

	summarizeValues: function summarizeValues(values) {
		var summary = '';

		if (values.length < this.props.multiSumLimit) {
			this.state.values.forEach(function (opt, i) {
				summary = summary + opt.label;
				if (i < values.length - 1) {
					summary = summary + ', ';
				}
			});
			return summary;
		} else if (values.length === this.props.options.length) {
			return 'All';
		} else if (values.length >= this.props.options.length - 2) {
			this.state.filteredOptions.forEach(function (opt) {
				summary = summary + ', ' + opt.label;
			});
			return 'All except' + summary;
		}

		return summary = values.length + ' of ' + this.props.options.length + ' selected';
	},

	isLoading: function isLoading() {
		return this.props.isLoading || this.state.isLoading;
	},

	render: function render() {
		var selectClass = classes('Select', this.props.className, {
			'is-multi': this.props.multi,
			'is-searchable': this.props.searchable,
			'is-open': this.state.isOpen,
			'is-focused': this.state.isFocused,
			'is-loading': this.isLoading(),
			'is-disabled': this.props.disabled,
			'has-value': this.state.value
		});
		var value = [];
		if (this.props.multi) {

			this.state.values.forEach(function (val) {
				var onOptionLabelClick = this.handleOptionLabelClick.bind(this, val);
				var onRemove = this.removeValue.bind(this, val);
				var valueComponent = React.createElement(this.props.valueComponent, {
					key: val.value,
					option: val,
					renderer: this.props.valueRenderer,
					optionLabelClick: !!this.props.onOptionLabelClick,
					onOptionLabelClick: onOptionLabelClick,
					onRemove: onRemove,
					disabled: this.props.disabled
				});
				value.push(valueComponent);
			}, this);

			if (this.props.multiSum && value.length > 0) {
				value = this.summarizeValues(value);
			}
		}

		if (!this.state.inputValue && (!this.props.multi || !value.length)) {
			var val = this.state.values[0] || null;
			if (this.props.valueRenderer && !!this.state.values.length) {
				value.push(React.createElement(Value, {
					key: 0,
					option: val,
					renderer: this.props.valueRenderer,
					disabled: this.props.disabled }));
			} else {
				var singleValueComponent = React.createElement(this.props.singleValueComponent, {
					key: 'placeholder',
					value: val,
					placeholder: this.state.placeholder
				});
				value.push(singleValueComponent);
			}
		}

		var loading = this.isLoading() ? React.createElement('span', { className: 'Select-loading', 'aria-hidden': 'true' }) : null;
		var clear = this.props.clearable && this.state.value && !this.props.disabled ? React.createElement('span', { className: 'Select-clear', title: this.props.multi ? this.props.clearAllText : this.props.clearValueText, 'aria-label': this.props.multi ? this.props.clearAllText : this.props.clearValueText, onMouseDown: this.clearValue, onTouchEnd: this.clearValue, onClick: this.clearValue, dangerouslySetInnerHTML: { __html: '&times;' } }) : null;

		var menu;
		var menuProps;
		if (this.state.isOpen) {
			menuProps = {
				ref: 'menu',
				className: 'Select-menu',
				onMouseDown: this.handleMouseDownOnMenu
			};
			menu = React.createElement(
				'div',
				{ ref: 'selectMenuContainer', className: 'Select-menu-outer' },
				React.createElement(
					'div',
					menuProps,
					this.buildMenu()
				)
			);
		}

		var input;
		var inputProps = {
			ref: 'input',
			className: 'Select-input ' + (this.props.inputProps.className || ''),
			tabIndex: this.props.tabIndex || 0,
			onFocus: this.handleInputFocus,
			onBlur: this.handleInputBlur
		};
		for (var key in this.props.inputProps) {
			if (this.props.inputProps.hasOwnProperty(key) && key !== 'className') {
				inputProps[key] = this.props.inputProps[key];
			}
		}

		if (!this.props.disabled) {
			if (this.props.searchable) {
				input = React.createElement(Input, _extends({ value: this.state.inputValue, onChange: this.handleInputChange, minWidth: '5' }, inputProps));
			} else {
				input = React.createElement(
					'div',
					inputProps,
					' '
				);
			}
		} else if (!this.props.multi || !this.state.values.length) {
			input = React.createElement(
				'div',
				{ className: 'Select-input' },
				' '
			);
		}

		return React.createElement(
			'div',
			{ ref: 'wrapper', className: selectClass },
			React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value, disabled: this.props.disabled }),
			React.createElement(
				'div',
				{ className: 'Select-control', ref: 'control', onKeyDown: this.handleKeyDown, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
				value,
				input,
				React.createElement('span', { className: 'Select-arrow-zone', onMouseDown: this.handleMouseDownOnArrow }),
				React.createElement('span', { className: 'Select-arrow', onMouseDown: this.handleMouseDownOnArrow }),
				loading,
				clear
			),
			menu
		);
	}

});

module.exports = Select;

},{"./Option":1,"./SingleValue":2,"./Value":3,"classnames":undefined,"react":undefined,"react-dom":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3N1c2llbHUvZ2l0aHViL3JlYWN0LXNlbGVjdC9zcmMvT3B0aW9uLmpzIiwiL1VzZXJzL3N1c2llbHUvZ2l0aHViL3JlYWN0LXNlbGVjdC9zcmMvU2luZ2xlVmFsdWUuanMiLCIvVXNlcnMvc3VzaWVsdS9naXRodWIvcmVhY3Qtc2VsZWN0L3NyYy9WYWx1ZS5qcyIsIi9Vc2Vycy9zdXNpZWx1L2dpdGh1Yi9yZWFjdC1zZWxlY3Qvc3JjL1NlbGVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFcEMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQzlCLFVBQVMsRUFBRTtBQUNWLGNBQVksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU07QUFDcEMsV0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTTtBQUNqQyxXQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO0FBQy9CLFlBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDaEMsWUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUNoQyxRQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUN6QyxZQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO0VBQ2hDOztBQUVELFdBQVUsRUFBQyxvQkFBQyxLQUFLLEVBQUU7QUFDbEIsT0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3ZCLE1BQUksQUFBQyxL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Q1AsS0FBSztJQUNEO0dBQ0wsSUFBSTtHQUNBLENBQ0w7RUFDRjs7Q0FFRCxDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgT3B0aW9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRhZGRMYWJlbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIHN0cmluZyByZW5kZXJlZCBpbiBjYXNlIG9mIGFsbG93Q3JlYXRlIG9wdGlvbiBwYXNzZWQgdG8gUmVhY3RTZWxlY3Rcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgICAgIC8vIGNsYXNzTmFtZSAoYmFzZWQgb24gbW91c2UgcG9zaXRpb24pXG5cdFx0bW91c2VEb3duOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIGNsaWNrIG9uIG9wdGlvbiBlbGVtZW50XG5cdFx0bW91c2VFbnRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIG1vdXNlRW50ZXIgb24gb3B0aW9uIGVsZW1lbnRcblx0XHRtb3VzZUxlYXZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgbW91c2VMZWF2ZSBvbiBvcHRpb24gZWxlbWVudFxuXHRcdG9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAgICAgLy8gb2JqZWN0IHRoYXQgaXMgYmFzZSBmb3IgdGhhdCBvcHRpb25cblx0XHRyZW5kZXJGdW5jOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyAgICAgICAgICAgICAgIC8vIG1ldGhvZCBwYXNzZWQgdG8gUmVhY3RTZWxlY3QgY29tcG9uZW50IHRvIHJlbmRlciBsYWJlbCB0ZXh0XG5cdH0sXG5cblx0YmxvY2tFdmVudCAoZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGlmICgoZXZlbnQudGFyZ2V0LnRhZ05hbWUgIT09ICdBJykgfHwgISgnaHJlZicgaW4gZXZlbnQudGFyZ2V0KSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChldmVudC50YXJnZXQudGFyZ2V0KSB7XG5cdFx0XHR3aW5kb3cub3BlbihldmVudC50YXJnZXQuaHJlZik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gZXZlbnQudGFyZ2V0LmhyZWY7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbmRlciAoKSB7XG5cdFx0dmFyIG9iaiA9IHRoaXMucHJvcHMub3B0aW9uO1xuXHRcdHZhciByZW5kZXJlZExhYmVsID0gdGhpcy5wcm9wcy5yZW5kZXJGdW5jKG9iaik7XG5cdFx0dmFyIG9wdGlvbkNsYXNzZXMgPSBjbGFzc2VzKHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvYmouY2xhc3NOYW1lKTtcblxuXHRcdHJldHVybiBvYmouZGlzYWJsZWQgPyAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17b3B0aW9uQ2xhc3Nlc31cblx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMuYmxvY2tFdmVudH1cblx0XHRcdFx0b25DbGljaz17dGhpcy5ibG9ja0V2ZW50fT5cblx0XHRcdFx0e3JlbmRlcmVkTGFiZWx9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpIDogKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e29wdGlvbkNsYXNzZXN9XG5cdFx0XHRcdCBzdHlsZT17b2JqLnN0eWxlfVxuXHRcdFx0XHQgb25Nb3VzZUVudGVyPXt0aGlzLnByb3BzLm1vdXNlRW50ZXJ9XG5cdFx0XHRcdCBvbk1vdXNlTGVhdmU9e3RoaXMucHJvcHMubW91c2VMZWF2ZX1cblx0XHRcdFx0IG9uTW91c2VEb3duPXt0aGlzLnByb3BzLm1vdXNlRG93bn1cblx0XHRcdFx0IG9uQ2xpY2s9e3RoaXMucHJvcHMubW91c2VEb3dufVxuXHRcdFx0XHQgdGl0bGU9e29iai50aXRsZX0+XG5cdFx0XHRcdDxzcGFuPnsgb2JqLmNyZWF0ZSA/IHRoaXMucHJvcHMuYWRkTGFiZWxUZXh0LnJlcGxhY2UoJ3tsYWJlbH0nLCBvYmoubGFiZWwpIDogcmVuZGVyZWRMYWJlbCB9PC9zcGFuPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gT3B0aW9uO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgU2luZ2xlVmFsdWUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHByb3BUeXBlczoge1xuXHRcdHBsYWNlaG9sZGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAvLyB0aGlzIGlzIGRlZmF1bHQgdmFsdWUgcHJvdmlkZWQgYnkgUmVhY3QtU2VsZWN0IGJhc2VkIGNvbXBvbmVudFxuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0ICAgICAgICAgICAgICAvLyBzZWxlY3RlZCBvcHRpb25cblx0fSxcblx0cmVuZGVyICgpIHtcblx0XHR2YXIgY2xhc3NOYW1lcyA9IGNsYXNzZXMoJ1NlbGVjdC1wbGFjZWhvbGRlcicsIHRoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy52YWx1ZS5jbGFzc05hbWUpO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2XG5cdFx0XHRcdGNsYXNzTmFtZT17Y2xhc3NOYW1lc31cblx0XHRcdFx0c3R5bGU9e3RoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy52YWx1ZS5zdHlsZX1cblx0XHRcdFx0dGl0bGU9e3RoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy52YWx1ZS50aXRsZX1cblx0XHRcdFx0Pnt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfTwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmdsZVZhbHVlO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgVmFsdWUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0ZGlzcGxheU5hbWU6ICdWYWx1ZScsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgICAgICAvLyBkaXNhYmxlZCBwcm9wIHBhc3NlZCB0byBSZWFjdFNlbGVjdFxuXHRcdG9uT3B0aW9uTGFiZWxDbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSBjbGljayBvbiB2YWx1ZSBsYWJlbFxuXHRcdG9uUmVtb3ZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSByZW1vdmUgb2YgdGhhdCB2YWx1ZVxuXHRcdG9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAgICAgICAgLy8gb3B0aW9uIHBhc3NlZCB0byBjb21wb25lbnRcblx0XHRvcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIGluZGljYXRlcyBpZiBvbk9wdGlvbkxhYmVsQ2xpY2sgc2hvdWxkIGJlIGhhbmRsZWRcblx0XHRyZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMgICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byByZW5kZXIgb3B0aW9uIGxhYmVsIHBhc3NlZCB0byBSZWFjdFNlbGVjdFxuXHR9LFxuXG5cdGJsb2NrRXZlbnQgKGV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdH0sXG5cblx0aGFuZGxlT25SZW1vdmUgKGV2ZW50KSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLmRpc2FibGVkKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uUmVtb3ZlKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0cmVuZGVyICgpIHtcblx0XHR2YXIgbGFiZWwgPSB0aGlzLnByb3BzLm9wdGlvbi5sYWJlbDtcblx0XHRpZiAodGhpcy5wcm9wcy5yZW5kZXJlcikge1xuXHRcdFx0bGFiZWwgPSB0aGlzLnByb3BzLnJlbmRlcmVyKHRoaXMucHJvcHMub3B0aW9uKTtcblx0XHR9XG5cblx0XHRpZighdGhpcy5wcm9wcy5vblJlbW92ZSAmJiAhdGhpcy5wcm9wcy5vcHRpb25MYWJlbENsaWNrKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPXtjbGFzc2VzKCdTZWxlY3QtdmFsdWUnLCB0aGlzLnByb3BzLm9wdGlvbi5jbGFzc05hbWUpfVxuXHRcdFx0XHRcdHN0eWxlPXt0aGlzLnByb3BzLm9wdGlvbi5zdHlsZX1cblx0XHRcdFx0XHR0aXRsZT17dGhpcy5wcm9wcy5vcHRpb24udGl0bGV9XG5cdFx0XHRcdD57bGFiZWx9PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnByb3BzLm9wdGlvbkxhYmVsQ2xpY2spIHtcblx0XHRcdGxhYmVsID0gKFxuXHRcdFx0XHQ8YSBjbGFzc05hbWU9e2NsYXNzZXMoJ1NlbGVjdC1pdGVtLWxhYmVsX19hJywgdGhpcy5wcm9wcy5vcHRpb24uY2xhc3NOYW1lKX1cblx0XHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5ibG9ja0V2ZW50fVxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfVxuXHRcdFx0XHRcdHN0eWxlPXt0aGlzLnByb3BzLm9wdGlvbi5zdHlsZX1cblx0XHRcdFx0XHR0aXRsZT17dGhpcy5wcm9wcy5vcHRpb24udGl0bGV9PlxuXHRcdFx0XHRcdHtsYWJlbH1cblx0XHRcdFx0PC9hPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXMoJ1NlbGVjdC1pdGVtJywgdGhpcy5wcm9wcy5vcHRpb24uY2xhc3NOYW1lKX1cblx0XHRcdFx0IHN0eWxlPXt0aGlzLnByb3BzLm9wdGlvbi5zdHlsZX1cblx0XHRcdFx0IHRpdGxlPXt0aGlzLnByb3BzLm9wdGlvbi50aXRsZX0+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWljb25cIlxuXHRcdFx0XHRcdG9uTW91c2VEb3duPXt0aGlzLmJsb2NrRXZlbnR9XG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy5oYW5kbGVPblJlbW92ZX1cblx0XHRcdFx0XHRvblRvdWNoRW5kPXt0aGlzLmhhbmRsZU9uUmVtb3ZlfT4mdGltZXM7PC9zcGFuPlxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbS1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZhbHVlO1xuIiwiLyogZGlzYWJsZSBzb21lIHJ1bGVzIHVudGlsIHdlIHJlZmFjdG9yIG1vcmUgY29tcGxldGVseTsgZml4aW5nIHRoZW0gbm93IHdvdWxkXG4gICBjYXVzZSBjb25mbGljdHMgd2l0aCBzb21lIG9wZW4gUFJzIHVubmVjZXNzYXJpbHkuICovXG4vKiBlc2xpbnQgcmVhY3QvanN4LXNvcnQtcHJvcC10eXBlczogMCwgcmVhY3Qvc29ydC1jb21wOiAwLCByZWFjdC9wcm9wLXR5cGVzOiAwICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcbnZhciBJbnB1dCA9IHJlcXVpcmUoJ3JlYWN0LWlucHV0LWF1dG9zaXplJyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoJy4vVmFsdWUnKTtcbnZhciBTaW5nbGVWYWx1ZSA9IHJlcXVpcmUoJy4vU2luZ2xlVmFsdWUnKTtcbnZhciBPcHRpb24gPSByZXF1aXJlKCcuL09wdGlvbicpO1xuXG52YXIgcmVxdWVzdElkID0gMDtcblxudmFyIFNlbGVjdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRkaXNwbGF5TmFtZTogJ1NlbGVjdCcsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0YWRkTGFiZWxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgIC8vIHBsYWNlaG9sZGVyIGRpc3BsYXllZCB3aGVuIHlvdSB3YW50IHRvIGFkZCBhIGxhYmVsIG9uIGEgbXVsdGktdmFsdWUgaW5wdXRcblx0XHRhbGxvd0NyZWF0ZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgLy8gd2hldGhlciB0byBhbGxvdyBjcmVhdGlvbiBvZiBuZXcgZW50cmllc1xuXHRcdGFzeW5jT3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAvLyBmdW5jdGlvbiB0byBjYWxsIHRvIGdldCBvcHRpb25zXG5cdFx0YXV0b2xvYWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdG8gYXV0by1sb2FkIHRoZSBkZWZhdWx0IGFzeW5jIG9wdGlvbnMgc2V0XG5cdFx0YmFja3NwYWNlUmVtb3ZlczogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgIC8vIHdoZXRoZXIgYmFja3NwYWNlIHJlbW92ZXMgYW4gaXRlbSBpZiB0aGVyZSBpcyBubyB0ZXh0IGlucHV0XG5cdFx0Y2FjaGVBc3luY1Jlc3VsdHM6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgIC8vIHdoZXRoZXIgdG8gYWxsb3cgY2FjaGVcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gY2xhc3NOYW1lIGZvciB0aGUgb3V0ZXIgZWxlbWVudFxuXHRcdGNsZWFyQWxsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sIHdoZW4gbXVsdGk6IHRydWVcblx0XHRjbGVhclZhbHVlVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgLy8gdGl0bGUgZm9yIHRoZSBcImNsZWFyXCIgY29udHJvbFxuXHRcdGNsZWFyYWJsZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAvLyBzaG91bGQgaXQgYmUgcG9zc2libGUgdG8gcmVzZXQgdmFsdWVcblx0XHRkZWxpbWl0ZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gZGVsaW1pdGVyIHRvIHVzZSB0byBqb2luIG11bHRpcGxlIHZhbHVlc1xuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAvLyB3aGV0aGVyIHRoZSBTZWxlY3QgaXMgZGlzYWJsZWQgb3Igbm90XG5cdFx0ZmlsdGVyT3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIG1ldGhvZCB0byBmaWx0ZXIgYSBzaW5nbGUgb3B0aW9uICAob3B0aW9uLCBmaWx0ZXJTdHJpbmcpXG5cdFx0ZmlsdGVyT3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgIC8vIG1ldGhvZCB0byBmaWx0ZXIgdGhlIG9wdGlvbnMgYXJyYXk6IGZ1bmN0aW9uIChbb3B0aW9uc10sIGZpbHRlclN0cmluZywgW3ZhbHVlc10pXG5cdFx0aWdub3JlQ2FzZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgIC8vIHdoZXRoZXIgdG8gcGVyZm9ybSBjYXNlLWluc2Vuc2l0aXZlIGZpbHRlcmluZ1xuXHRcdGlucHV0UHJvcHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsICAgICAgICAvLyBjdXN0b20gYXR0cmlidXRlcyBmb3IgdGhlIElucHV0IChpbiB0aGUgU2VsZWN0LWNvbnRyb2wpIGUuZzogeydkYXRhLWZvbyc6ICdiYXInfVxuXHRcdGlzTG9hZGluZzogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAvLyB3aGV0aGVyIHRoZSBTZWxlY3QgaXMgbG9hZGluZyBleHRlcm5hbGx5IG9yIG5vdCAoc3VjaCBhcyBvcHRpb25zIGJlaW5nIGxvYWRlZClcblx0XHRsYWJlbEtleTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgLy8gcGF0aCBvZiB0aGUgbGFiZWwgdmFsdWUgaW4gb3B0aW9uIG9iamVjdHNcblx0XHRtYXRjaFBvczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgLy8gKGFueXxzdGFydCkgbWF0Y2ggdGhlIHN0YXJ0IG9yIGVudGlyZSBzdHJpbmcgd2hlbiBmaWx0ZXJpbmdcblx0XHRtYXRjaFByb3A6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gKGFueXxsYWJlbHx2YWx1ZSkgd2hpY2ggb3B0aW9uIHByb3BlcnR5IHRvIGZpbHRlciBvblxuXHRcdG11bHRpOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgICAvLyBtdWx0aS12YWx1ZSBpbnB1dFxuXHRcdG11bHRpU3VtOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcdFx0XHQgICAvLyBtdWx0aVN1bSBvcHRpb24gZW5hYmxlclxuXHRcdG11bHRpU3VtTGltaXQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXHQgICAvLyBsaW1pdCBmb3IgdGhlIG51bWJlciBvZiBvcHRpb25zIGJlZm9yZSBpdCBzdW1tYXJpemVzIHRvIHggb2YgeVxuXHRcdG5hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgICAgICAvLyBmaWVsZCBuYW1lLCBmb3IgaGlkZGVuIDxpbnB1dCAvPiB0YWdcblx0XHRuZXdPcHRpb25DcmVhdG9yOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgLy8gZmFjdG9yeSB0byBjcmVhdGUgbmV3IG9wdGlvbnMgd2hlbiBhbGxvd0NyZWF0ZSBzZXRcblx0XHRub1Jlc3VsdHNUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoaW5nIHNlYXJjaCByZXN1bHRzXG5cdFx0b25CbHVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgIC8vIG9uQmx1ciBoYW5kbGVyOiBmdW5jdGlvbiAoZXZlbnQpIHt9XG5cdFx0b25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgIC8vIG9uQ2hhbmdlIGhhbmRsZXI6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge31cblx0XHRvbkZvY3VzOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgLy8gb25Gb2N1cyBoYW5kbGVyOiBmdW5jdGlvbiAoZXZlbnQpIHt9XG5cdFx0b25JbnB1dENoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgIC8vIG9uSW5wdXRDaGFuZ2UgaGFuZGxlcjogZnVuY3Rpb24gKGlucHV0VmFsdWUpIHt9XG5cdFx0b25PcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgIC8vIG9uQ0xpY2sgaGFuZGxlciBmb3IgdmFsdWUgbGFiZWxzOiBmdW5jdGlvbiAodmFsdWUsIGV2ZW50KSB7fVxuXHRcdG9wdGlvbkNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAvLyBvcHRpb24gY29tcG9uZW50IHRvIHJlbmRlciBpbiBkcm9wZG93blxuXHRcdG9wdGlvblJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAvLyBvcHRpb25SZW5kZXJlcjogZnVuY3Rpb24gKG9wdGlvbikge31cblx0XHRvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksICAgICAgICAgICAgLy8gYXJyYXkgb2Ygb3B0aW9uc1xuXHRcdHBsYWNlaG9sZGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAvLyBmaWVsZCBwbGFjZWhvbGRlciwgZGlzcGxheWVkIHdoZW4gdGhlcmUncyBubyB2YWx1ZVxuXHRcdHNlYXJjaGFibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAvLyB3aGV0aGVyIHRvIGVuYWJsZSBzZWFyY2hpbmcgZmVhdHVyZSBvciBub3Rcblx0XHRzZWFyY2hpbmdUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgLy8gbWVzc2FnZSB0byBkaXNwbGF5IHdoaWxzdCBvcHRpb25zIGFyZSBsb2FkaW5nIHZpYSBhc3luY09wdGlvbnNcblx0XHRzZWFyY2hQcm9tcHRUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgLy8gbGFiZWwgdG8gcHJvbXB0IGZvciBzZWFyY2ggaW5wdXRcblx0XHRzaW5nbGVWYWx1ZUNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsLy8gc2luZ2xlIHZhbHVlIGNvbXBvbmVudCB3aGVuIG11bHRpcGxlIGlzIHNldCB0byBmYWxzZVxuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuYW55LCAgICAgICAgICAgICAgICAvLyBpbml0aWFsIGZpZWxkIHZhbHVlXG5cdFx0dmFsdWVDb21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgIC8vIHZhbHVlIGNvbXBvbmVudCB0byByZW5kZXIgaW4gbXVsdGlwbGUgbW9kZVxuXHRcdHZhbHVlS2V5OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAvLyBwYXRoIG9mIHRoZSBsYWJlbCB2YWx1ZSBpbiBvcHRpb24gb2JqZWN0c1xuXHRcdHZhbHVlUmVuZGVyZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jICAgICAgICAvLyB2YWx1ZVJlbmRlcmVyOiBmdW5jdGlvbiAob3B0aW9uKSB7fVxuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wcyAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFkZExhYmVsVGV4dDogJ0FkZCBcIntsYWJlbH1cIj8nLFxuXHRcdFx0YWxsb3dDcmVhdGU6IGZhbHNlLFxuXHRcdFx0YXN5bmNPcHRpb25zOiB1bmRlZmluZWQsXG5cdFx0XHRhdXRvbG9hZDogdHJ1ZSxcblx0XHRcdGJhY2tzcGFjZVJlbW92ZXM6IHRydWUsXG5cdFx0XHRjYWNoZUFzeW5jUmVzdWx0czogdHJ1ZSxcblx0XHRcdGNsYXNzTmFtZTogdW5kZWZpbmVkLFxuXHRcdFx0Y2xlYXJBbGxUZXh0OiAnQ2xlYXIgYWxsJyxcblx0XHRcdGNsZWFyVmFsdWVUZXh0OiAnQ2xlYXIgdmFsdWUnLFxuXHRcdFx0Y2xlYXJhYmxlOiB0cnVlLFxuXHRcdFx0ZGVsaW1pdGVyOiAnLCcsXG5cdFx0XHRkaXNhYmxlZDogZmFsc2UsXG5cdFx0XHRpZ25vcmVDYXNlOiB0cnVlLFxuXHRcdFx0aW5wdXRQcm9wczoge30sXG5cdFx0XHRpc0xvYWRpbmc6IGZhbHNlLFxuXHRcdFx0bGFiZWxLZXk6ICdsYWJlbCcsXG5cdFx0XHRtYXRjaFBvczogJ2FueScsXG5cdFx0XHRtYXRjaFByb3A6ICdhbnknLFxuXHRcdFx0bXVsdGlTdW1MaW1pdDogMyxcblx0XHRcdG5hbWU6IHVuZGVmaW5lZCxcblx0XHRcdG5ld09wdGlvbkNyZWF0b3I6IHVuZGVmaW5lZCxcblx0XHRcdG5vUmVzdWx0c1RleHQ6ICdObyByZXN1bHRzIGZvdW5kJyxcblx0XHRcdG9uQ2hhbmdlOiB1bmRlZmluZWQsXG5cdFx0XHRvbklucHV0Q2hhbmdlOiB1bmRlZmluZWQsXG5cdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IHVuZGVmaW5lZCxcblx0XHRcdG9wdGlvbkNvbXBvbmVudDogT3B0aW9uLFxuXHRcdFx0b3B0aW9uczogdW5kZWZpbmVkLFxuXHRcdFx0cGxhY2Vob2xkZXI6ICdTZWxlY3QuLi4nLFxuXHRcdFx0c2VhcmNoYWJsZTogdHJ1ZSxcblx0XHRcdHNlYXJjaGluZ1RleHQ6ICdTZWFyY2hpbmcuLi4nLFxuXHRcdFx0c2VhcmNoUHJvbXB0VGV4dDogJ1R5cGUgdG8gc2VhcmNoJyxcblx0XHRcdHNpbmdsZVZhbHVlQ29tcG9uZW50OiBTaW5nbGVWYWx1ZSxcblx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHR2YWx1ZUNvbXBvbmVudDogVmFsdWUsXG5cdFx0XHR2YWx1ZUtleTogJ3ZhbHVlJ1xuXHRcdH07XG5cdH0sXG5cblx0Z2V0SW5pdGlhbFN0YXRlICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Lypcblx0XHRcdCAqIHNldCBieSBnZXRTdGF0ZUZyb21WYWx1ZSBvbiBjb21wb25lbnRXaWxsTW91bnQ6XG5cdFx0XHQgKiAtIHZhbHVlXG5cdFx0XHQgKiAtIHZhbHVlc1xuXHRcdFx0ICogLSBmaWx0ZXJlZE9wdGlvbnNcblx0XHRcdCAqIC0gaW5wdXRWYWx1ZVxuXHRcdFx0ICogLSBwbGFjZWhvbGRlclxuXHRcdFx0ICogLSBmb2N1c2VkT3B0aW9uXG5cdFx0XHQqL1xuXHRcdFx0aXNGb2N1c2VkOiBmYWxzZSxcblx0XHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0XHRpc09wZW46IGZhbHNlLFxuXHRcdFx0b3B0aW9uczogdGhpcy5wcm9wcy5vcHRpb25zXG5cdFx0fTtcblx0fSxcblxuXHRjb21wb25lbnRXaWxsTW91bnQgKCkge1xuXHRcdHRoaXMuX29wdGlvbnNDYWNoZSA9IHt9O1xuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSAnJztcblx0XHR0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBtZW51RWxlbSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5zZWxlY3RNZW51Q29udGFpbmVyKTtcblx0XHRcdHZhciBjb250cm9sRWxlbSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5jb250cm9sKTtcblxuXHRcdFx0dmFyIGV2ZW50T2NjdXJlZE91dHNpZGVNZW51ID0gdGhpcy5jbGlja2VkT3V0c2lkZUVsZW1lbnQobWVudUVsZW0sIGV2ZW50KTtcblx0XHRcdHZhciBldmVudE9jY3VyZWRPdXRzaWRlQ29udHJvbCA9IHRoaXMuY2xpY2tlZE91dHNpZGVFbGVtZW50KGNvbnRyb2xFbGVtLCBldmVudCk7XG5cblx0XHRcdC8vIEhpZGUgZHJvcGRvd24gbWVudSBpZiBjbGljayBvY2N1cnJlZCBvdXRzaWRlIG9mIG1lbnVcblx0XHRcdGlmIChldmVudE9jY3VyZWRPdXRzaWRlTWVudSAmJiBldmVudE9jY3VyZWRPdXRzaWRlQ29udHJvbCkge1xuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0XHRcdH0sIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSAoKSA9PiB7XG5cdFx0XHRpZiAoIWRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJiYgZG9jdW1lbnQuYXR0YWNoRXZlbnQpIHtcblx0XHRcdFx0ZG9jdW1lbnQuYXR0YWNoRXZlbnQoJ29uY2xpY2snLCB0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gKCkgPT4ge1xuXHRcdFx0aWYgKCFkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICYmIGRvY3VtZW50LmRldGFjaEV2ZW50KSB7XG5cdFx0XHRcdGRvY3VtZW50LmRldGFjaEV2ZW50KCdvbmNsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlRnJvbVZhbHVlKHRoaXMucHJvcHMudmFsdWUpKTtcblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudCAoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuYXN5bmNPcHRpb25zICYmIHRoaXMucHJvcHMuYXV0b2xvYWQpIHtcblx0XHRcdHRoaXMuYXV0b2xvYWRBc3luY09wdGlvbnMoKTtcblx0XHR9XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQgKCkge1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9ibHVyVGltZW91dCk7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2ZvY3VzVGltZW91dCk7XG5cdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgKG5ld1Byb3BzKSB7XG5cdFx0dmFyIG9wdGlvbnNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0aWYgKEpTT04uc3RyaW5naWZ5KG5ld1Byb3BzLm9wdGlvbnMpICE9PSBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLm9wdGlvbnMpKSB7XG5cdFx0XHRvcHRpb25zQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0b3B0aW9uczogbmV3UHJvcHMub3B0aW9ucyxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiB0aGlzLmZpbHRlck9wdGlvbnMobmV3UHJvcHMub3B0aW9ucylcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAobmV3UHJvcHMudmFsdWUgIT09IHRoaXMuc3RhdGUudmFsdWUgfHwgbmV3UHJvcHMucGxhY2Vob2xkZXIgIT09IHRoaXMucHJvcHMucGxhY2Vob2xkZXIgfHwgb3B0aW9uc0NoYW5nZWQpIHtcblx0XHRcdHZhciBzZXRTdGF0ZSA9IChuZXdTdGF0ZSkgPT4ge1xuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUobmV3UHJvcHMudmFsdWUsXG5cdFx0XHRcdFx0KG5ld1N0YXRlICYmIG5ld1N0YXRlLm9wdGlvbnMpIHx8IG5ld1Byb3BzLm9wdGlvbnMsXG5cdFx0XHRcdFx0bmV3UHJvcHMucGxhY2Vob2xkZXJcblx0XHRcdFx0KSk7XG5cdFx0XHR9O1xuXHRcdFx0aWYgKHRoaXMucHJvcHMuYXN5bmNPcHRpb25zKSB7XG5cdFx0XHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucyhuZXdQcm9wcy52YWx1ZSwge30sIHNldFN0YXRlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNldFN0YXRlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZSAoKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLmRpc2FibGVkICYmIHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUpIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9ibHVyVGltZW91dCk7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5fZm9jdXNUaW1lb3V0KTtcblx0XHRcdHRoaXMuX2ZvY3VzVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRpZiAoIXRoaXMuaXNNb3VudGVkKCkpIHJldHVybjtcblx0XHRcdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuXHRcdFx0XHR0aGlzLl9mb2N1c0FmdGVyVXBkYXRlID0gZmFsc2U7XG5cdFx0XHR9LCA1MCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsKSB7XG5cdFx0XHRpZiAodGhpcy5yZWZzLmZvY3VzZWQgJiYgdGhpcy5yZWZzLm1lbnUpIHtcblx0XHRcdFx0dmFyIGZvY3VzZWRET00gPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnMuZm9jdXNlZCk7XG5cdFx0XHRcdHZhciBtZW51RE9NID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzLm1lbnUpO1xuXHRcdFx0XHR2YXIgZm9jdXNlZFJlY3QgPSBmb2N1c2VkRE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHR2YXIgbWVudVJlY3QgPSBtZW51RE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdGlmIChmb2N1c2VkUmVjdC5ib3R0b20gPiBtZW51UmVjdC5ib3R0b20gfHwgZm9jdXNlZFJlY3QudG9wIDwgbWVudVJlY3QudG9wKSB7XG5cdFx0XHRcdFx0bWVudURPTS5zY3JvbGxUb3AgPSAoZm9jdXNlZERPTS5vZmZzZXRUb3AgKyBmb2N1c2VkRE9NLmNsaWVudEhlaWdodCAtIG1lbnVET00ub2Zmc2V0SGVpZ2h0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCA9IGZhbHNlO1xuXHRcdH1cblx0fSxcblxuXHRmb2N1cyAoKSB7XG5cdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuXHR9LFxuXG5cdGNsaWNrZWRPdXRzaWRlRWxlbWVudCAoZWxlbWVudCwgZXZlbnQpIHtcblx0XHR2YXIgZXZlbnRUYXJnZXQgPSAoZXZlbnQudGFyZ2V0KSA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnNyY0VsZW1lbnQ7XG5cdFx0d2hpbGUgKGV2ZW50VGFyZ2V0ICE9IG51bGwpIHtcblx0XHRcdGlmIChldmVudFRhcmdldCA9PT0gZWxlbWVudCkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0ZXZlbnRUYXJnZXQgPSBldmVudFRhcmdldC5vZmZzZXRQYXJlbnQ7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdGdldFN0YXRlRnJvbVZhbHVlICh2YWx1ZSwgb3B0aW9ucywgcGxhY2Vob2xkZXIpIHtcblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnM7XG5cdFx0fVxuXHRcdGlmICghcGxhY2Vob2xkZXIpIHtcblx0XHRcdHBsYWNlaG9sZGVyID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlcjtcblx0XHR9XG5cblx0XHQvLyByZXNldCBpbnRlcm5hbCBmaWx0ZXIgc3RyaW5nXG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9ICcnO1xuXG5cdFx0dmFyIHZhbHVlcyA9IHRoaXMuaW5pdFZhbHVlc0FycmF5KHZhbHVlLCBvcHRpb25zKTtcblx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKG9wdGlvbnMsIHZhbHVlcyk7XG5cblx0XHR2YXIgZm9jdXNlZE9wdGlvbjtcblx0XHR2YXIgdmFsdWVGb3JTdGF0ZSA9IG51bGw7XG5cdFx0aWYgKCF0aGlzLnByb3BzLm11bHRpICYmIHZhbHVlcy5sZW5ndGgpIHtcblx0XHRcdGZvY3VzZWRPcHRpb24gPSB2YWx1ZXNbMF07XG5cdFx0XHR2YWx1ZUZvclN0YXRlID0gdmFsdWVzWzBdW3RoaXMucHJvcHMudmFsdWVLZXldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb2N1c2VkT3B0aW9uID0gdGhpcy5nZXRGaXJzdEZvY3VzYWJsZU9wdGlvbihmaWx0ZXJlZE9wdGlvbnMpO1xuXHRcdFx0dmFsdWVGb3JTdGF0ZSA9IHZhbHVlcy5tYXAoKHYpID0+IHsgcmV0dXJuIHZbdGhpcy5wcm9wcy52YWx1ZUtleV07IH0pLmpvaW4odGhpcy5wcm9wcy5kZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogdmFsdWVGb3JTdGF0ZSxcblx0XHRcdHZhbHVlczogdmFsdWVzLFxuXHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdHBsYWNlaG9sZGVyOiAhdGhpcy5wcm9wcy5tdWx0aSAmJiB2YWx1ZXMubGVuZ3RoID8gdmFsdWVzWzBdW3RoaXMucHJvcHMubGFiZWxLZXldIDogcGxhY2Vob2xkZXIsXG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fTtcblx0fSxcblxuXHRnZXRGaXJzdEZvY3VzYWJsZU9wdGlvbiAgKG9wdGlvbnMpIHtcblxuXHRcdGZvciAodmFyIG9wdGlvbkluZGV4ID0gMDsgb3B0aW9uSW5kZXggPCBvcHRpb25zLmxlbmd0aDsgKytvcHRpb25JbmRleCkge1xuXHRcdFx0aWYgKCFvcHRpb25zW29wdGlvbkluZGV4XS5kaXNhYmxlZCkge1xuXHRcdFx0XHRyZXR1cm4gb3B0aW9uc1tvcHRpb25JbmRleF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdGluaXRWYWx1ZXNBcnJheSAodmFsdWVzLCBvcHRpb25zKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcblx0XHRcdGlmICh0eXBlb2YgdmFsdWVzID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMgPT09ICcnXG5cdFx0XHRcdFx0PyBbXVxuXHRcdFx0XHRcdDogdGhpcy5wcm9wcy5tdWx0aVxuXHRcdFx0XHRcdFx0PyB2YWx1ZXMuc3BsaXQodGhpcy5wcm9wcy5kZWxpbWl0ZXIpXG5cdFx0XHRcdFx0XHQ6IFsgdmFsdWVzIF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZXMgIT09IG51bGwgPyBbdmFsdWVzXSA6IFtdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWVzLm1hcCgodmFsKSA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmXG5cdFx0XHRcdFx0XHRvcHRpb25zW2tleV0gJiZcblx0XHRcdFx0XHRcdChvcHRpb25zW2tleV1bdGhpcy5wcm9wcy52YWx1ZUtleV0gPT09IHZhbCB8fFxuXHRcdFx0XHRcdFx0XHR0eXBlb2Ygb3B0aW9uc1trZXldW3RoaXMucHJvcHMudmFsdWVLZXldID09PSAnbnVtYmVyJyAmJlxuXHRcdFx0XHRcdFx0XHRvcHRpb25zW2tleV1bdGhpcy5wcm9wcy52YWx1ZUtleV0udG9TdHJpbmcoKSA9PT0gdmFsXG5cdFx0XHRcdFx0XHQpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb3B0aW9uc1trZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4geyB2YWx1ZTogdmFsLCBsYWJlbDogdmFsIH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdmFsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdHNldFZhbHVlICh2YWx1ZSwgZm9jdXNBZnRlclVwZGF0ZSkge1xuXHRcdGlmIChmb2N1c0FmdGVyVXBkYXRlIHx8IGZvY3VzQWZ0ZXJVcGRhdGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fZm9jdXNBZnRlclVwZGF0ZSA9IHRydWU7XG5cdFx0fVxuXHRcdHZhciBuZXdTdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUodmFsdWUpO1xuXHRcdG5ld1N0YXRlLmlzT3BlbiA9IGZhbHNlO1xuXHRcdHRoaXMuZmlyZUNoYW5nZUV2ZW50KG5ld1N0YXRlKTtcblx0XHR0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcblx0fSxcblxuXHRzZWxlY3RWYWx1ZSAodmFsdWUpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUodmFsdWUpO1xuXHRcdH0gZWxzZSBpZiAodmFsdWUpIHtcblx0XHRcdHRoaXMuYWRkVmFsdWUodmFsdWUpO1xuXHRcdH1cblx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdH0sXG5cblx0YWRkVmFsdWUgKHZhbHVlKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5jb25jYXQodmFsdWUpKTtcblx0fSxcblxuXHRwb3BWYWx1ZSAoKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5zbGljZSgwLCB0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGggLSAxKSk7XG5cdH0sXG5cblx0cmVtb3ZlVmFsdWUgKHZhbHVlVG9SZW1vdmUpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmZpbHRlcihmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlICE9PSB2YWx1ZVRvUmVtb3ZlO1xuXHRcdH0pKTtcblx0fSxcblxuXHRjbGVhclZhbHVlIChldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIGlnbm9yZSBpdC5cblx0XHRpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5zZXRWYWx1ZShudWxsKTtcblx0fSxcblxuXHRyZXNldFZhbHVlICgpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWUgPT09ICcnID8gbnVsbCA6IHRoaXMuc3RhdGUudmFsdWUpO1xuXHR9LFxuXG5cdGdldElucHV0Tm9kZSAgKCkge1xuXHRcdHZhciBpbnB1dCA9IHRoaXMucmVmcy5pbnB1dDtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5zZWFyY2hhYmxlID8gaW5wdXQgOiBSZWFjdERPTS5maW5kRE9NTm9kZShpbnB1dCk7XG5cdH0sXG5cblx0ZmlyZUNoYW5nZUV2ZW50IChuZXdTdGF0ZSkge1xuXHRcdGlmIChuZXdTdGF0ZS52YWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSAmJiB0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1N0YXRlLnZhbHVlLCBuZXdTdGF0ZS52YWx1ZXMpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVNb3VzZURvd24gKGV2ZW50KSB7XG5cdFx0Ly8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuXHRcdC8vIGJ1dHRvbiwgb3IgaWYgdGhlIGNvbXBvbmVudCBpcyBkaXNhYmxlZCwgaWdub3JlIGl0LlxuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8IChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gIT09IDApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHQvLyBmb3IgdGhlIG5vbi1zZWFyY2hhYmxlIHNlbGVjdCwgY2xvc2UgdGhlIGRyb3Bkb3duIHdoZW4gYnV0dG9uIGlzIGNsaWNrZWRcblx0XHRpZiAodGhpcy5zdGF0ZS5pc09wZW4gJiYgIXRoaXMucHJvcHMuc2VhcmNoYWJsZSkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHRcdH0sIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnN0YXRlLmlzRm9jdXNlZCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogdHJ1ZVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9vcGVuQWZ0ZXJGb2N1cyA9IHRydWU7XG5cdFx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZU1vdXNlRG93bk9uTWVudSAoZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBvciBpZiB0aGUgY29tcG9uZW50IGlzIGRpc2FibGVkLCBpZ25vcmUgaXQuXG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fSxcblxuXHRoYW5kbGVNb3VzZURvd25PbkFycm93IChldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIG9yIGlmIHRoZSBjb21wb25lbnQgaXMgZGlzYWJsZWQsIGlnbm9yZSBpdC5cblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvLyBJZiBub3QgZm9jdXNlZCwgaGFuZGxlTW91c2VEb3duIHdpbGwgaGFuZGxlIGl0XG5cdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdH0sIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHR9LFxuXG5cdGhhbmRsZUlucHV0Rm9jdXMgKGV2ZW50KSB7XG5cdFx0dmFyIG5ld0lzT3BlbiA9IHRoaXMuc3RhdGUuaXNPcGVuIHx8IHRoaXMuX29wZW5BZnRlckZvY3VzO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNGb2N1c2VkOiB0cnVlLFxuXHRcdFx0aXNPcGVuOiBuZXdJc09wZW5cblx0XHR9LCAoKSA9PiB7XG5cdFx0XHRpZiAobmV3SXNPcGVuKSB7XG5cdFx0XHRcdHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX29wZW5BZnRlckZvY3VzID0gZmFsc2U7XG5cdFx0aWYgKHRoaXMucHJvcHMub25Gb2N1cykge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkZvY3VzKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRCbHVyIChldmVudCkge1xuXHRcdHRoaXMuX2JsdXJUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5fZm9jdXNBZnRlclVwZGF0ZSB8fCAhdGhpcy5pc01vdW50ZWQoKSkgcmV0dXJuO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzRm9jdXNlZDogZmFsc2UsXG5cdFx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH0sIDUwKTtcblx0XHRpZiAodGhpcy5wcm9wcy5vbkJsdXIpIHtcblx0XHRcdHRoaXMucHJvcHMub25CbHVyKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlS2V5RG93biAoZXZlbnQpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCkgcmV0dXJuO1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSA4OiAvLyBiYWNrc3BhY2Vcblx0XHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlucHV0VmFsdWUgJiYgdGhpcy5wcm9wcy5iYWNrc3BhY2VSZW1vdmVzKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR0aGlzLnBvcFZhbHVlKCk7XG5cdFx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgOTogLy8gdGFiXG5cdFx0XHRcdGlmIChldmVudC5zaGlmdEtleSB8fCAhdGhpcy5zdGF0ZS5pc09wZW4gfHwgIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxMzogLy8gZW50ZXJcblx0XHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3BlbikgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAyNzogLy8gZXNjYXBlXG5cdFx0XHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0XHRcdHRoaXMucmVzZXRWYWx1ZSgpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMucHJvcHMuY2xlYXJhYmxlKSB7XG5cdFx0XHRcdFx0dGhpcy5jbGVhclZhbHVlKGV2ZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM4OiAvLyB1cFxuXHRcdFx0XHR0aGlzLmZvY3VzUHJldmlvdXNPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA0MDogLy8gZG93blxuXHRcdFx0XHR0aGlzLmZvY3VzTmV4dE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDE4ODogLy8gLFxuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5hbGxvd0NyZWF0ZSAmJiB0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogcmV0dXJuO1xuXHRcdH1cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXG5cdC8vIEVuc3VyZXMgdGhhdCB0aGUgY3VycmVudGx5IGZvY3VzZWQgb3B0aW9uIGlzIGF2YWlsYWJsZSBpbiBmaWx0ZXJlZE9wdGlvbnMuXG5cdC8vIElmIG5vdCwgcmV0dXJucyB0aGUgZmlyc3QgYXZhaWxhYmxlIG9wdGlvbi5cblx0X2dldE5ld0ZvY3VzZWRPcHRpb24gKGZpbHRlcmVkT3B0aW9ucykge1xuXHRcdGZvciAodmFyIGtleSBpbiBmaWx0ZXJlZE9wdGlvbnMpIHtcblx0XHRcdGlmIChmaWx0ZXJlZE9wdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBmaWx0ZXJlZE9wdGlvbnNba2V5XSA9PT0gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSB7XG5cdFx0XHRcdHJldHVybiBmaWx0ZXJlZE9wdGlvbnNba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZ2V0Rmlyc3RGb2N1c2FibGVPcHRpb24oZmlsdGVyZWRPcHRpb25zKTtcblx0fSxcblxuXHRoYW5kbGVJbnB1dENoYW5nZSAoZXZlbnQpIHtcblx0XHQvLyBhc3NpZ24gYW4gaW50ZXJuYWwgdmFyaWFibGUgYmVjYXVzZSB3ZSBuZWVkIHRvIHVzZVxuXHRcdC8vIHRoZSBsYXRlc3QgdmFsdWUgYmVmb3JlIHNldFN0YXRlKCkgaGFzIGNvbXBsZXRlZC5cblx0XHR0aGlzLl9vcHRpb25zRmlsdGVyU3RyaW5nID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMub25JbnB1dENoYW5nZSkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbklucHV0Q2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvcHMuYXN5bmNPcHRpb25zKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNMb2FkaW5nOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5sb2FkQXN5bmNPcHRpb25zKGV2ZW50LnRhcmdldC52YWx1ZSwge1xuXHRcdFx0XHRpc0xvYWRpbmc6IGZhbHNlLFxuXHRcdFx0XHRpc09wZW46IHRydWVcblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyh0aGlzLnN0YXRlLm9wdGlvbnMpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogdHJ1ZSxcblx0XHRcdFx0aW5wdXRWYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlLFxuXHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5fZ2V0TmV3Rm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMpXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fVxuXHR9LFxuXG5cdGF1dG9sb2FkQXN5bmNPcHRpb25zICgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzTG9hZGluZzogdHJ1ZVxuXHRcdH0pO1xuXHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucygodGhpcy5wcm9wcy52YWx1ZSB8fCAnJyksIHsgaXNMb2FkaW5nOiBmYWxzZSB9LCAoKSA9PiB7XG5cdFx0XHQvLyB1cGRhdGUgd2l0aCBuZXcgb3B0aW9ucyBidXQgZG9uJ3QgZm9jdXNcblx0XHRcdHRoaXMuc2V0VmFsdWUodGhpcy5wcm9wcy52YWx1ZSwgZmFsc2UpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGxvYWRBc3luY09wdGlvbnMgKGlucHV0LCBzdGF0ZSwgY2FsbGJhY2spIHtcblx0XHR2YXIgdGhpc1JlcXVlc3RJZCA9IHRoaXMuX2N1cnJlbnRSZXF1ZXN0SWQgPSByZXF1ZXN0SWQrKztcblx0XHRpZiAodGhpcy5wcm9wcy5jYWNoZUFzeW5jUmVzdWx0cykge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPD0gaW5wdXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGNhY2hlS2V5ID0gaW5wdXQuc2xpY2UoMCwgaSk7XG5cdFx0XHRcdGlmICh0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldICYmIChpbnB1dCA9PT0gY2FjaGVLZXkgfHwgdGhpcy5fb3B0aW9uc0NhY2hlW2NhY2hlS2V5XS5jb21wbGV0ZSkpIHtcblx0XHRcdFx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0ub3B0aW9ucztcblx0XHRcdFx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKG9wdGlvbnMpO1xuXHRcdFx0XHRcdHZhciBuZXdTdGF0ZSA9IHtcblx0XHRcdFx0XHRcdG9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0XHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuX2dldE5ld0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHN0YXRlKSB7XG5cdFx0XHRcdFx0XHRpZiAoc3RhdGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdFx0XHRuZXdTdGF0ZVtrZXldID0gc3RhdGVba2V5XTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdFx0XHRcdFx0aWYgKGNhbGxiYWNrKSBjYWxsYmFjay5jYWxsKHRoaXMsIG5ld1N0YXRlKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyhpbnB1dCwgKGVyciwgZGF0YSkgPT4ge1xuXHRcdFx0aWYgKGVycikgdGhyb3cgZXJyO1xuXHRcdFx0aWYgKHRoaXMucHJvcHMuY2FjaGVBc3luY1Jlc3VsdHMpIHtcblx0XHRcdFx0dGhpcy5fb3B0aW9uc0NhY2hlW2lucHV0XSA9IGRhdGE7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpc1JlcXVlc3RJZCAhPT0gdGhpcy5fY3VycmVudFJlcXVlc3RJZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKGRhdGEub3B0aW9ucyk7XG5cdFx0XHR2YXIgbmV3U3RhdGUgPSB7XG5cdFx0XHRcdG9wdGlvbnM6IGRhdGEub3B0aW9ucyxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuX2dldE5ld0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zKVxuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBzdGF0ZSkge1xuXHRcdFx0XHRpZiAoc3RhdGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdG5ld1N0YXRlW2tleV0gPSBzdGF0ZVtrZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcblx0XHRcdGlmIChjYWxsYmFjaykge1xuXHRcdFx0XHRjYWxsYmFjay5jYWxsKHRoaXMsIG5ld1N0YXRlKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRmaWx0ZXJPcHRpb25zIChvcHRpb25zLCB2YWx1ZXMpIHtcblx0XHR2YXIgZmlsdGVyVmFsdWUgPSB0aGlzLl9vcHRpb25zRmlsdGVyU3RyaW5nO1xuXHRcdHZhciBleGNsdWRlID0gKHZhbHVlcyB8fCB0aGlzLnN0YXRlLnZhbHVlcykubWFwKGZ1bmN0aW9uKGkpIHtcblx0XHRcdHJldHVybiBpLnZhbHVlO1xuXHRcdH0pO1xuXHRcdGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbnMpIHtcblx0XHRcdHJldHVybiB0aGlzLnByb3BzLmZpbHRlck9wdGlvbnMuY2FsbCh0aGlzLCBvcHRpb25zLCBmaWx0ZXJWYWx1ZSwgZXhjbHVkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBmaWx0ZXJPcHRpb24gPSBmdW5jdGlvbihvcCkge1xuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSAmJiBleGNsdWRlLmluZGV4T2Yob3BbdGhpcy5wcm9wcy52YWx1ZUtleV0pID4gLTEpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uKSByZXR1cm4gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb24uY2FsbCh0aGlzLCBvcCwgZmlsdGVyVmFsdWUpO1xuXHRcdFx0XHR2YXIgdmFsdWVUZXN0ID0gU3RyaW5nKG9wW3RoaXMucHJvcHMudmFsdWVLZXldKTtcblx0XHRcdFx0dmFyIGxhYmVsVGVzdCA9IFN0cmluZyhvcFt0aGlzLnByb3BzLmxhYmVsS2V5XSk7XG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmlnbm9yZUNhc2UpIHtcblx0XHRcdFx0XHR2YWx1ZVRlc3QgPSB2YWx1ZVRlc3QudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRsYWJlbFRlc3QgPSBsYWJlbFRlc3QudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRmaWx0ZXJWYWx1ZSA9IGZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuICFmaWx0ZXJWYWx1ZSB8fCAodGhpcy5wcm9wcy5tYXRjaFBvcyA9PT0gJ3N0YXJ0JykgPyAoXG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAnbGFiZWwnICYmIHZhbHVlVGVzdC5zdWJzdHIoMCwgZmlsdGVyVmFsdWUubGVuZ3RoKSA9PT0gZmlsdGVyVmFsdWUpIHx8XG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAndmFsdWUnICYmIGxhYmVsVGVzdC5zdWJzdHIoMCwgZmlsdGVyVmFsdWUubGVuZ3RoKSA9PT0gZmlsdGVyVmFsdWUpXG5cdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAnbGFiZWwnICYmIHZhbHVlVGVzdC5pbmRleE9mKGZpbHRlclZhbHVlKSA+PSAwKSB8fFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ3ZhbHVlJyAmJiBsYWJlbFRlc3QuaW5kZXhPZihmaWx0ZXJWYWx1ZSkgPj0gMClcblx0XHRcdFx0KTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gKG9wdGlvbnMgfHwgW10pLmZpbHRlcihmaWx0ZXJPcHRpb24sIHRoaXMpO1xuXHRcdH1cblx0fSxcblxuXHRzZWxlY3RGb2N1c2VkT3B0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5hbGxvd0NyZWF0ZSAmJiAhdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZWxlY3RWYWx1ZSh0aGlzLnN0YXRlLmlucHV0VmFsdWUpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIHtcblx0XHRcdHJldHVybiB0aGlzLnNlbGVjdFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbik7XG5cdFx0fVxuXHR9LFxuXG5cdGZvY3VzT3B0aW9uIChvcCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Zm9jdXNlZE9wdGlvbjogb3Bcblx0XHR9KTtcblx0fSxcblxuXHRmb2N1c05leHRPcHRpb24gKCkge1xuXHRcdHRoaXMuZm9jdXNBZGphY2VudE9wdGlvbignbmV4dCcpO1xuXHR9LFxuXG5cdGZvY3VzUHJldmlvdXNPcHRpb24gKCkge1xuXHRcdHRoaXMuZm9jdXNBZGphY2VudE9wdGlvbigncHJldmlvdXMnKTtcblx0fSxcblxuXHRmb2N1c0FkamFjZW50T3B0aW9uIChkaXIpIHtcblx0XHR0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsID0gdHJ1ZTtcblxuXHRcdHZhciBvcHMgPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24ob3ApIHtcblx0XHRcdHJldHVybiAhb3AuZGlzYWJsZWQ7XG5cdFx0fSk7XG5cblx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIHx8IG9wc1tkaXIgPT09ICduZXh0JyA/IDAgOiBvcHMubGVuZ3RoIC0gMV1cblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKCFvcHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHZhciBmb2N1c2VkSW5kZXggPSAtMTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA9PT0gb3BzW2ldKSB7XG5cdFx0XHRcdGZvY3VzZWRJbmRleCA9IGk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgZm9jdXNlZE9wdGlvbiA9IG9wc1swXTtcblx0XHRpZiAoZGlyID09PSAnbmV4dCcgJiYgZm9jdXNlZEluZGV4ID4gLTEgJiYgZm9jdXNlZEluZGV4IDwgb3BzLmxlbmd0aCAtIDEpIHtcblx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbZm9jdXNlZEluZGV4ICsgMV07XG5cdFx0fSBlbHNlIGlmIChkaXIgPT09ICdwcmV2aW91cycpIHtcblx0XHRcdGlmIChmb2N1c2VkSW5kZXggPiAwKSB7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbZm9jdXNlZEluZGV4IC0gMV07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb2N1c2VkT3B0aW9uID0gb3BzW29wcy5sZW5ndGggLSAxXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fSk7XG5cdH0sXG5cblx0dW5mb2N1c09wdGlvbiAob3ApIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uID09PSBvcCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IG51bGxcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRidWlsZE1lbnUgKCkge1xuXHRcdHZhciBmb2N1c2VkVmFsdWUgPSB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gPyB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb25bdGhpcy5wcm9wcy52YWx1ZUtleV0gOiBudWxsO1xuXHRcdHZhciByZW5kZXJMYWJlbCA9IHRoaXMucHJvcHMub3B0aW9uUmVuZGVyZXIgfHwgZnVuY3Rpb24ob3ApIHtcblx0XHRcdHJldHVybiBvcC5sYWJlbDtcblx0XHR9O1xuXG5cdFx0aWYgKHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLmxlbmd0aCA+IDApIHtcblx0XHRcdGZvY3VzZWRWYWx1ZSA9IGZvY3VzZWRWYWx1ZSA9PSBudWxsID8gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnNbMF0gOiBmb2N1c2VkVmFsdWU7XG5cdFx0fVxuXHRcdC8vIEFkZCB0aGUgY3VycmVudCB2YWx1ZSB0byB0aGUgZmlsdGVyZWQgb3B0aW9ucyBpbiBsYXN0IHJlc29ydFxuXHRcdHZhciBvcHRpb25zID0gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnM7XG5cdFx0aWYgKHRoaXMucHJvcHMuYWxsb3dDcmVhdGUgJiYgdGhpcy5zdGF0ZS5pbnB1dFZhbHVlLnRyaW0oKSkge1xuXHRcdFx0dmFyIGlucHV0VmFsdWUgPSB0aGlzLnN0YXRlLmlucHV0VmFsdWU7XG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucy5zbGljZSgpO1xuXHRcdFx0dmFyIG5ld09wdGlvbiA9IHRoaXMucHJvcHMubmV3T3B0aW9uQ3JlYXRvciA/IHRoaXMucHJvcHMubmV3T3B0aW9uQ3JlYXRvcihpbnB1dFZhbHVlKSA6IHtcblx0XHRcdFx0dmFsdWU6IGlucHV0VmFsdWUsXG5cdFx0XHRcdGxhYmVsOiBpbnB1dFZhbHVlLFxuXHRcdFx0XHRjcmVhdGU6IHRydWVcblx0XHRcdH07XG5cdFx0XHRvcHRpb25zLnVuc2hpZnQobmV3T3B0aW9uKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSAmJiB0aGlzLnByb3BzLm11bHRpU3VtKXtcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zLm1hcChmdW5jdGlvbihvcHQpe1xuXHRcdFx0XHRvcHQudHlwZSA9ICdvcHQnO1xuXHRcdFx0XHRvcHQuaXNNdWx0aSA9IGZhbHNlO1xuXHRcdFx0XHRvcHQucmVuZGVyTGFiZWwgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdG9wdC5zZWxlY3RWYWx1ZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0cmV0dXJuIG9wdDtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAodGhpcy5zdGF0ZS52YWx1ZXMubGVuZ3RoID4gMCl7XG5cdFx0XHRcdHZhciBtdWx0aVZhbHVlcyA9IHRoaXMuc3RhdGUudmFsdWVzLm1hcChmdW5jdGlvbih2YWwpe1xuXHRcdFx0XHRcdHZhbC50eXBlID0gJ211bHRpU3VtJztcblx0XHRcdFx0XHR2YWwuaXNNdWx0aSA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIG9wdGlvblJlbmRlcmVyID0gdGhpcy5wcm9wcy5vcHRpb25SZW5kZXJlcjtcblx0XHRcdFx0XHR2YWwucmVuZGVyTGFiZWwgPSBmdW5jdGlvbihvcCl7XG5cdFx0XHRcdFx0XHR2YXIgbGFiZWwgPSBvcC5sYWJlbDtcblx0XHRcdFx0XHRcdGlmIChvcHRpb25SZW5kZXJlcil7XG5cdFx0XHRcdFx0XHRcdGxhYmVsID0gb3B0aW9uUmVuZGVyZXIob3ApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuICd4ICcgKyBsYWJlbDtcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0dmFsLnNlbGVjdFZhbHVlID0gdGhpcy5yZW1vdmVWYWx1ZS5iaW5kKHRoaXMsIHZhbCk7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbDtcblx0XHRcdFx0fSwgdGhpcyk7XG5cblx0XHRcdFx0b3B0aW9ucyA9IG11bHRpVmFsdWVzLmNvbmNhdChvcHRpb25zKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgb3BzID0gb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3ApIHtcblx0XHRcdHZhciBpc1NlbGVjdGVkID0gdGhpcy5zdGF0ZS52YWx1ZSA9PT0gb3AudmFsdWU7XG5cdFx0XHR2YXIgaXNGb2N1c2VkID0gZm9jdXNlZFZhbHVlID09PSBvcC52YWx1ZTtcblxuXHRcdFx0dmFyIG9wdGlvbkNsYXNzID0gY2xhc3Nlcyh7XG5cdFx0XHRcdCdTZWxlY3Qtb3B0aW9uJzogdHJ1ZSxcblx0XHRcdFx0J2lzLXNlbGVjdGVkJzogaXNTZWxlY3RlZCxcblx0XHRcdFx0J2lzLWZvY3VzZWQnOiBpc0ZvY3VzZWQsXG5cdFx0XHRcdCdpcy1kaXNhYmxlZCc6IG9wLmRpc2FibGVkLFxuXHRcdFx0XHQnaXMtbXVsdGlTdW0nOiBvcC5pc011bHRpXG5cdFx0XHR9KTtcblx0XHRcdHZhciByZWYgPSBpc0ZvY3VzZWQgPyAnZm9jdXNlZCcgOiBudWxsO1xuXHRcdFx0dmFyIG1vdXNlRW50ZXIgPSB0aGlzLmZvY3VzT3B0aW9uLmJpbmQodGhpcywgb3ApO1xuXHRcdFx0dmFyIG1vdXNlTGVhdmUgPSB0aGlzLnVuZm9jdXNPcHRpb24uYmluZCh0aGlzLCBvcCk7XG5cdFx0XHR2YXIgbW91c2VEb3duID0gb3Auc2VsZWN0VmFsdWUgfHwgdGhpcy5zZWxlY3RWYWx1ZS5iaW5kKHRoaXMsIG9wKTtcblx0XHRcdHZhciBvcHRpb25SZXN1bHQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMub3B0aW9uQ29tcG9uZW50LCB7XG5cdFx0XHRcdGtleTogJ29wdGlvbi0nICsgb3BbdGhpcy5wcm9wcy52YWx1ZUtleV0sXG5cdFx0XHRcdGNsYXNzTmFtZTogb3B0aW9uQ2xhc3MsXG5cdFx0XHRcdHJlbmRlckZ1bmM6ICggb3AucmVuZGVyTGFiZWwgfHwgcmVuZGVyTGFiZWwpLFxuXHRcdFx0XHRtb3VzZUVudGVyOiBtb3VzZUVudGVyLFxuXHRcdFx0XHRtb3VzZUxlYXZlOiBtb3VzZUxlYXZlLFxuXHRcdFx0XHRtb3VzZURvd246IG1vdXNlRG93bixcblx0XHRcdFx0Y2xpY2s6IG1vdXNlRG93bixcblx0XHRcdFx0YWRkTGFiZWxUZXh0OiB0aGlzLnByb3BzLmFkZExhYmVsVGV4dCxcblx0XHRcdFx0b3B0aW9uOiBvcCxcblx0XHRcdFx0cmVmOiByZWZcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG9wdGlvblJlc3VsdDtcblx0XHR9LCB0aGlzKTtcblxuXG5cblx0XHRpZiAob3BzLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIG9wcztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIG5vUmVzdWx0c1RleHQsIHByb21wdENsYXNzO1xuXHRcdFx0aWYgKHRoaXMuaXNMb2FkaW5nKCkpIHtcblx0XHRcdFx0cHJvbXB0Q2xhc3MgPSAnU2VsZWN0LXNlYXJjaGluZyc7XG5cdFx0XHRcdG5vUmVzdWx0c1RleHQgPSB0aGlzLnByb3BzLnNlYXJjaGluZ1RleHQ7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSB8fCAhdGhpcy5wcm9wcy5hc3luY09wdGlvbnMpIHtcblx0XHRcdFx0cHJvbXB0Q2xhc3MgPSAnU2VsZWN0LW5vcmVzdWx0cyc7XG5cdFx0XHRcdG5vUmVzdWx0c1RleHQgPSB0aGlzLnByb3BzLm5vUmVzdWx0c1RleHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwcm9tcHRDbGFzcyA9ICdTZWxlY3Qtc2VhcmNoLXByb21wdCc7XG5cdFx0XHRcdG5vUmVzdWx0c1RleHQgPSB0aGlzLnByb3BzLnNlYXJjaFByb21wdFRleHQ7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPXtwcm9tcHRDbGFzc30+XG5cdFx0XHRcdFx0e25vUmVzdWx0c1RleHR9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlT3B0aW9uTGFiZWxDbGljayAgKHZhbHVlLCBldmVudCkge1xuXHRcdGlmICh0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljaykge1xuXHRcdFx0dGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2sodmFsdWUsIGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0c3VtbWFyaXplVmFsdWVzICh2YWx1ZXMpe1xuXHRcdHZhciBzdW1tYXJ5ID0gJyc7XG5cblx0XHRpZiAodmFsdWVzLmxlbmd0aCA8IHRoaXMucHJvcHMubXVsdGlTdW1MaW1pdCl7XG5cdFx0XHR0aGlzLnN0YXRlLnZhbHVlcy5mb3JFYWNoKCBmdW5jdGlvbihvcHQsIGkpe1xuXHRcdFx0XHRzdW1tYXJ5ID0gc3VtbWFyeSArIG9wdC5sYWJlbDtcblx0XHRcdFx0aWYgKGkgPCAodmFsdWVzLmxlbmd0aCAtIDEpICl7XG5cdFx0XHRcdFx0c3VtbWFyeSA9IHN1bW1hcnkgKyAnLCAnO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBzdW1tYXJ5O1xuXG5cdFx0fSBlbHNlIGlmICh2YWx1ZXMubGVuZ3RoID09PSB0aGlzLnByb3BzLm9wdGlvbnMubGVuZ3RoKXtcblx0XHRcdHJldHVybiAnQWxsJztcblx0XHR9IGVsc2UgaWYgKHZhbHVlcy5sZW5ndGggPj0gKHRoaXMucHJvcHMub3B0aW9ucy5sZW5ndGggLSAyKSApe1xuXHRcdFx0dGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24ob3B0KXtcblx0XHRcdFx0c3VtbWFyeSA9IHN1bW1hcnkgKyAnLCAnICsgb3B0LmxhYmVsO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gJ0FsbCBleGNlcHQnICsgc3VtbWFyeTtcblx0XHR9XG5cblx0XHRyZXR1cm5cdHN1bW1hcnkgPSB2YWx1ZXMubGVuZ3RoICsgJyBvZiAnICsgdGhpcy5wcm9wcy5vcHRpb25zLmxlbmd0aCArICcgc2VsZWN0ZWQnO1xuXHR9LFxuXG5cblx0aXNMb2FkaW5nICgpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5pc0xvYWRpbmcgfHwgdGhpcy5zdGF0ZS5pc0xvYWRpbmc7XG5cdH0sXG5cblx0cmVuZGVyICgpIHtcblx0XHR2YXIgc2VsZWN0Q2xhc3MgPSBjbGFzc2VzKCdTZWxlY3QnLCB0aGlzLnByb3BzLmNsYXNzTmFtZSwge1xuXHRcdFx0J2lzLW11bHRpJzogdGhpcy5wcm9wcy5tdWx0aSxcblx0XHRcdCdpcy1zZWFyY2hhYmxlJzogdGhpcy5wcm9wcy5zZWFyY2hhYmxlLFxuXHRcdFx0J2lzLW9wZW4nOiB0aGlzLnN0YXRlLmlzT3Blbixcblx0XHRcdCdpcy1mb2N1c2VkJzogdGhpcy5zdGF0ZS5pc0ZvY3VzZWQsXG5cdFx0XHQnaXMtbG9hZGluZyc6IHRoaXMuaXNMb2FkaW5nKCksXG5cdFx0XHQnaXMtZGlzYWJsZWQnOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuXHRcdFx0J2hhcy12YWx1ZSc6IHRoaXMuc3RhdGUudmFsdWVcblx0XHR9KTtcblx0XHR2YXIgdmFsdWUgPSBbXTtcblx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSkge1xuXG5cdFx0XHR0aGlzLnN0YXRlLnZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0XHR2YXIgb25PcHRpb25MYWJlbENsaWNrID0gdGhpcy5oYW5kbGVPcHRpb25MYWJlbENsaWNrLmJpbmQodGhpcywgdmFsKTtcblx0XHRcdFx0dmFyIG9uUmVtb3ZlID0gdGhpcy5yZW1vdmVWYWx1ZS5iaW5kKHRoaXMsIHZhbCk7XG5cdFx0XHRcdHZhciB2YWx1ZUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy52YWx1ZUNvbXBvbmVudCwge1xuXHRcdFx0XHRcdGtleTogdmFsLnZhbHVlLFxuXHRcdFx0XHRcdG9wdGlvbjogdmFsLFxuXHRcdFx0XHRcdHJlbmRlcmVyOiB0aGlzLnByb3BzLnZhbHVlUmVuZGVyZXIsXG5cdFx0XHRcdFx0b3B0aW9uTGFiZWxDbGljazogISF0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljayxcblx0XHRcdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IG9uT3B0aW9uTGFiZWxDbGljayxcblx0XHRcdFx0XHRvblJlbW92ZTogb25SZW1vdmUsXG5cdFx0XHRcdFx0ZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHZhbHVlLnB1c2godmFsdWVDb21wb25lbnQpO1xuXHRcdFx0fSwgdGhpcyk7XG5cblx0XHRcdGlmICh0aGlzLnByb3BzLm11bHRpU3VtICYmIHZhbHVlLmxlbmd0aCA+IDApe1xuXHRcdFx0XHR2YWx1ZSA9IHRoaXMuc3VtbWFyaXplVmFsdWVzKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSAmJiAoIXRoaXMucHJvcHMubXVsdGkgfHwgIXZhbHVlLmxlbmd0aCkpIHtcblx0XHRcdHZhciB2YWwgPSB0aGlzLnN0YXRlLnZhbHVlc1swXSB8fCBudWxsO1xuXHRcdFx0aWYgKHRoaXMucHJvcHMudmFsdWVSZW5kZXJlciAmJiAhIXRoaXMuc3RhdGUudmFsdWVzLmxlbmd0aCkge1xuXHRcdFx0XHR2YWx1ZS5wdXNoKDxWYWx1ZVxuXHRcdFx0XHRcdFx0a2V5PXswfVxuXHRcdFx0XHRcdFx0b3B0aW9uPXt2YWx9XG5cdFx0XHRcdFx0XHRyZW5kZXJlcj17dGhpcy5wcm9wcy52YWx1ZVJlbmRlcmVyfVxuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9IC8+KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBzaW5nbGVWYWx1ZUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy5zaW5nbGVWYWx1ZUNvbXBvbmVudCwge1xuXHRcdFx0XHRcdGtleTogJ3BsYWNlaG9sZGVyJyxcblx0XHRcdFx0XHR2YWx1ZTogdmFsLFxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyOiB0aGlzLnN0YXRlLnBsYWNlaG9sZGVyXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR2YWx1ZS5wdXNoKHNpbmdsZVZhbHVlQ29tcG9uZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgbG9hZGluZyA9IHRoaXMuaXNMb2FkaW5nKCkgPyA8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtbG9hZGluZ1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbDtcblx0XHR2YXIgY2xlYXIgPSB0aGlzLnByb3BzLmNsZWFyYWJsZSAmJiB0aGlzLnN0YXRlLnZhbHVlICYmICF0aGlzLnByb3BzLmRpc2FibGVkID8gPHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWNsZWFyXCIgdGl0bGU9e3RoaXMucHJvcHMubXVsdGkgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IGFyaWEtbGFiZWw9e3RoaXMucHJvcHMubXVsdGkgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IG9uTW91c2VEb3duPXt0aGlzLmNsZWFyVmFsdWV9IG9uVG91Y2hFbmQ9e3RoaXMuY2xlYXJWYWx1ZX0gb25DbGljaz17dGhpcy5jbGVhclZhbHVlfSBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6ICcmdGltZXM7JyB9fSAvPiA6IG51bGw7XG5cblx0XHR2YXIgbWVudTtcblx0XHR2YXIgbWVudVByb3BzO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0bWVudVByb3BzID0ge1xuXHRcdFx0XHRyZWY6ICdtZW51Jyxcblx0XHRcdFx0Y2xhc3NOYW1lOiAnU2VsZWN0LW1lbnUnLFxuXHRcdFx0XHRvbk1vdXNlRG93bjogdGhpcy5oYW5kbGVNb3VzZURvd25Pbk1lbnVcblx0XHRcdH07XG5cdFx0XHRtZW51ID0gKFxuXHRcdFx0XHQ8ZGl2IHJlZj1cInNlbGVjdE1lbnVDb250YWluZXJcIiBjbGFzc05hbWU9XCJTZWxlY3QtbWVudS1vdXRlclwiPlxuXHRcdFx0XHRcdDxkaXYgey4uLm1lbnVQcm9wc30+XG5cdFx0XHRcdFx0XHR7dGhpcy5idWlsZE1lbnUoKX1cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHZhciBpbnB1dDtcblx0XHR2YXIgaW5wdXRQcm9wcyA9IHtcblx0XHRcdHJlZjogJ2lucHV0Jyxcblx0XHRcdGNsYXNzTmFtZTogJ1NlbGVjdC1pbnB1dCAnICsgKHRoaXMucHJvcHMuaW5wdXRQcm9wcy5jbGFzc05hbWUgfHwgJycpLFxuXHRcdFx0dGFiSW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXggfHwgMCxcblx0XHRcdG9uRm9jdXM6IHRoaXMuaGFuZGxlSW5wdXRGb2N1cyxcblx0XHRcdG9uQmx1cjogdGhpcy5oYW5kbGVJbnB1dEJsdXJcblx0XHR9O1xuXHRcdGZvciAodmFyIGtleSBpbiB0aGlzLnByb3BzLmlucHV0UHJvcHMpIHtcblx0XHRcdGlmICh0aGlzLnByb3BzLmlucHV0UHJvcHMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkgIT09ICdjbGFzc05hbWUnKSB7XG5cdFx0XHRcdGlucHV0UHJvcHNba2V5XSA9IHRoaXMucHJvcHMuaW5wdXRQcm9wc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuXHRcdFx0aWYgKHRoaXMucHJvcHMuc2VhcmNoYWJsZSkge1xuXHRcdFx0XHRpbnB1dCA9IDxJbnB1dCB2YWx1ZT17dGhpcy5zdGF0ZS5pbnB1dFZhbHVlfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVJbnB1dENoYW5nZX0gbWluV2lkdGg9XCI1XCIgey4uLmlucHV0UHJvcHN9IC8+O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aW5wdXQgPSA8ZGl2IHsuLi5pbnB1dFByb3BzfT4mbmJzcDs8L2Rpdj47XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghdGhpcy5wcm9wcy5tdWx0aSB8fCAhdGhpcy5zdGF0ZS52YWx1ZXMubGVuZ3RoKSB7XG5cdFx0XHRpbnB1dCA9IDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LWlucHV0XCI+Jm5ic3A7PC9kaXY+O1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IHJlZj1cIndyYXBwZXJcIiBjbGFzc05hbWU9e3NlbGVjdENsYXNzfT5cblx0XHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiByZWY9XCJ2YWx1ZVwiIG5hbWU9e3RoaXMucHJvcHMubmFtZX0gdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9IGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfSAvPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1jb250cm9sXCIgcmVmPVwiY29udHJvbFwiIG9uS2V5RG93bj17dGhpcy5oYW5kbGVLZXlEb3dufSBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259IG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlTW91c2VEb3dufT5cblx0XHRcdFx0XHR7dmFsdWV9XG5cdFx0XHRcdFx0e2lucHV0fVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvdy16b25lXCIgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3duT25BcnJvd30gLz5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtYXJyb3dcIiBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd25PbkFycm93fSAvPlxuXHRcdFx0XHRcdHtsb2FkaW5nfVxuXHRcdFx0XHRcdHtjbGVhcn1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdHttZW51fVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Q7Il19
