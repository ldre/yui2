(function () {
	var Dom = YAHOO.util.Dom,
		Lang = YAHOO.lang, 
		Event = YAHOO.util.Event,
		TV = YAHOO.widget.TreeView,
		TVproto = TV.prototype;

	/**
	 * An object to store information used for in-line editing
	 * for all Nodes of all TreeViews
	 * @property _editorData
	 * @private
	 * @static
	 */
	TV._editorData = {
		active:false,
		whoHasIt:null, // which TreeView has it
		nodeType:null,
		editorPanel:null,
		inputContainer:null,
		buttonsContainer:null,
		node:null, // which Node is being edited
		saveOnEnter:true
		// Each node type is free to add its own properties to this as it sees fit.
	};
	
	/**
	* Entry point of the editing plug-in.  
	* TreeView will call this method if it exists when a node label is clicked
	* @method _nodeEditing
	* @param node {YAHOO.widget.Node} the node to be edited
	* @return {Boolean} true to indicate that the node is editable and prevent any further bubbling of the click.
	*/
	
	
	TVproto._nodeEditing = function (node) {
		if (node.fillEditorContainer && node.editable && Lang.isNull(node.href)) {
			var ed, topLeft, buttons, button, editorData = TV._editorData;
			editorData.active = true;
			editorData.whoHasIt = this;
			if (!editorData.nodeType) {
				editorData.editorPanel = ed = document.body.appendChild(document.createElement('div'));
				Dom.addClass(ed,'ygtv-label-editor');

				buttons = editorData.buttonsContainer = ed.appendChild(document.createElement('div'));
				Dom.addClass(buttons,'ygtv-button-container');
				button = buttons.appendChild(document.createElement('button'));
				Dom.addClass(button,'ygtvok');
				button.innerHTML = ' ';
				button = buttons.appendChild(document.createElement('button'));
				Dom.addClass(button,'ygtvcancel');
				button.innerHTML = ' ';
				Event.on(buttons, 'click', function (ev) {
					this.logger.log('click on editor');
					var target = Event.getTarget(ev);
					var node = TV._editorData.node;
					if (Dom.hasClass(target,'ygtvok')) {
						node.logger.log('ygtvok');
						Event.stopEvent(ev);
						this._closeEditor(true);
					}
					if (Dom.hasClass(target,'ygtvcancel')) {
						node.logger.log('ygtvcancel');
						Event.stopEvent(ev);
						this._closeEditor(false);
					}
				}, this, true);

				editorData.inputContainer = ed.appendChild(document.createElement('div'));
				Dom.addClass(editorData.inputContainer,'ygtv-input');
				
				Event.on(ed,'keydown',function (ev) {
					var editorData = TV._editorData,
						KEY = YAHOO.util.KeyListener.KEY;
					switch (ev.keyCode) {
						case KEY.ENTER:
							this.logger.log('ENTER');
							Event.stopEvent(ev);
							if (editorData.saveOnEnter) { 
								this._closeEditor(true);
							}
							break;
						case KEY.ESCAPE:
							this.logger.log('ESC');
							Event.stopEvent(ev);
							this._closeEditor(false);
							break;
					}
				},this,true);


				
			} else {
				ed = editorData.editorPanel;
			}
			editorData.node = node;
			if (editorData.nodeType) {
				Dom.removeClass(ed,'ygtv-edit-' + editorData.nodeType);
			}
			Dom.addClass(ed,' ygtv-edit-' + node._type);
			topLeft = Dom.getXY(node.getLabelEl());
			Dom.setStyle(ed,'left',topLeft[0] + 'px');
			Dom.setStyle(ed,'top',topLeft[1] + 'px');
			Dom.setStyle(ed,'display','block');
			ed.focus();
			node.fillEditorContainer(editorData);

			return true;  // If inline editor available, don't do anything else.
		}
	};
	
	/**
	* Method to be called when the inline editing is finished and the editor is to be closed
	* @method _closeEditor
	* @param save {Boolean} true if the edited value is to be saved, false if discarded
	* @private
	*/
	
	TVproto._closeEditor = function (save) {
		var ed = TV._editorData, 
			node = ed.node;
		if (save) { 
			var value = ed.node.getEditorValue(ed); 
			node.label = value;
			node.data.label = value;
			node.getLabelEl().innerHTML = value;
		}
		Dom.setStyle(ed.editorPanel,'display','none');	
		ed.active = false;
		node.focus();
	};
	
	/**
	*  Entry point for TreeView's destroy method to destroy whatever the editing plug-in has created
	* @method _destroyEditor
	* @private
	*/
	TVproto._destroyEditor = function() {
		var ed = TV._editorData;
		if (ed && ed.nodeType && (!ed.active || ed.whoHasIt === this)) {
			Event.removeListener(ed.editorPanel,'keydown');
			Event.removeListener(ed.buttonContainer,'click');
			ed.node.destroyEditorContents(ed);
			document.body.removeChild(ed.editorPanel);
			ed.nodeType = ed.editorPanel = ed.inputContainer = ed.buttonsContainer = ed.whoHasIt = ed.node = null;
			ed.active = false;
		}
	};
	
	var Nproto = YAHOO.widget.Node.prototype;
	
	/** Placeholder for a function that should provide the inline node label editor
	 *   Leaving it set to null will indicate that this node type is not editable
	 * Should be overridden by nodes that provide inline editing
	 *  The Node-specific editing element (input box, textarea or whatever) should be inserted into editorData.inputContainer.
	 * @method fillEditorContainer
	 * @param editorData {YAHOO.widget.TreeView._editorData}  a shortcut to the static object holding editing information
	 * @return void
	 */
	Nproto.fillEditorContainer = null;

	
	/**
	* Node-specific destroy function to empty the contents of the inline editor panel
	* This function is worst case that will purge all possible events and remove the contents
	* Method purgeElement is somewhat costly so if it can be avoided, it is better to do so.
	* @method destroyEditorContents
	 * @param editorData {YAHOO.widget.TreeView._editorData}  a shortcut to the static object holding editing information
	 */
	Nproto.destroyEditorContents = function (editorData) {
		// In the worst case, if the input editor (such as the Calendar) has no destroy method
		// we can only try to remove all possible events on it.
		Event.purgeElement(editorData.inputContainer,true);
		editorData.inputContainer.innerHTML = '';
	};

	/**
	* Returns the value entered into the editor
	* Should be overridden by each node type
	* @method getEditorValue
	 * @param editorData {YAHOO.widget.TreeView._editorData}  a shortcut to the static object holding editing information
	 * @return {mixed} usually some suitable value to display in the Node
	 */
	Nproto.getEditorValue = function (editorData) {
		return null;
	};
	
	var TNproto = YAHOO.widget.TextNode.prototype;
	
	/**
	* Signals if the label is editable.  Ignored on TextNodes with href set.
	* @property editable
	* @type boolean
	*/
	TNproto.editable = false;


	/** 
	 *  Places an &lt;input&gt;  textbox in the input container and loads the label text into it
	 * @method fillEditorContainer
	 * @param editorData {YAHOO.widget.TreeView._editorData}  a shortcut to the static object holding editing information
	 * @return void
	 */
	TNproto.fillEditorContainer = function (editorData) {
	
		var input;
		// If last node edited is not of the same type as this one, delete it and fill it with our editor
		if (editorData.nodeType != this._type) {
			editorData.nodeType = this._type;
			editorData.saveOnEnter = true;
			editorData.node.destroyEditorContents(editorData);

			editorData.inputElement = input = editorData.inputContainer.appendChild(document.createElement('input'));
			
		} else {
			// if the last node edited was of the same time, reuse the input element.
			input = editorData.inputElement;
		}

		input.value = this.label;
		input.focus();
		input.select();
	};
	
	/**
	* Returns the value entered into the editor
	* Overrides Node.getEditorValue
	* @method getEditorValue
	 * @param editorData {YAHOO.widget.TreeView._editorData}  a shortcut to the static object holding editing information
	 * @return {string} entered data
	 */
	TNproto.getEditorValue = function (editorData) {
		return editorData.inputElement.value;
	};

	/**
	* Destroys the contents of the inline editor panel
	* Overrides Node.destroyEditorContent
	* Since we didn't set any event listeners on this inline editor, it is more efficient to avoid the generic method in Node
	* @method destroyEditorContents
	 * @param editorData {YAHOO.widget.TreeView._editorData}  a shortcut to the static object holding editing information
	 */
	TNproto.destroyEditorContents = function (editorData) {
		editorData.inputContainer.innerHTML = '';
	};
})();