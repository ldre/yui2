(function () {
	var Dom = YAHOO.util.Dom,
		Lang = YAHOO.lang,
		Event = YAHOO.util.Event;
/**
 * The default node presentation.  The first parameter should be
 * either a string that will be used as the node's label, or an object
 * that has at least a string propery called label.  By default, the clicking the
 * label will toggle the expanded/collapsed state of the node.  By
 * changing the href property of the instance, this behavior can be
 * changed so that the label will go to the specified href.
 * @namespace YAHOO.widget
 * @class TextNode
 * @extends YAHOO.widget.Node
 * @constructor
 * @param oData {object} a string or object containing the data that will
 * be used to render this node.
 * Providing a string is the same as providing an object with a single property named label.
 * All values in the oData will be used to set equally named properties in the node
 * as long as the node does have such properties, they are not undefined, private or functions.
 * All attributes are made available in noderef.data, which
 * can be used to store custom attributes.  TreeView.getNode(s)ByProperty
 * can be used to retreive a node by one of the attributes.
 * @param oParent {YAHOO.widget.Node} this node's parent node
 * @param expanded {boolean} the initial expanded/collapsed state (deprecated; use oData.expanded) 
 */
YAHOO.widget.TextNode = function(oData, oParent, expanded) {

    if (oData) { 
        if (Lang.isString(oData)) {
            oData = { label: oData };
        }
        this.init(oData, oParent, expanded);
        this.setUpLabel(oData);
    }

    this.logger     = new YAHOO.widget.LogWriter(this.toString());
};

YAHOO.extend(YAHOO.widget.TextNode, YAHOO.widget.Node, {
    
    /**
     * The CSS class for the label href.  Defaults to ygtvlabel, but can be
     * overridden to provide a custom presentation for a specific node.
     * @property labelStyle
     * @type string
     */
    labelStyle: "ygtvlabel",

    /**
     * The derived element id of the label for this node
     * @property labelElId
     * @type string
     */
    labelElId: null,

    /**
     * The text for the label.  It is assumed that the oData parameter will
     * either be a string that will be used as the label, or an object that
     * has a property called "label" that we will use.
     * @property label
     * @type string
     */
    label: null,

    /**
     * The text for the title (tooltip) for the label element
     * @property title
     * @type string
     */
    title: null,
	

	
/**
     * Override for Node.prototype.firesLabelClick to enable firing ot labelClick on this type of node
     * @property firesLabelClick
     * @type boolean
     * @default true
     */
    firesLabelClick: true,
/**
     * The node type
     * @property _type
     * @private
     */
    _type: "TextNode",


    /**
     * Sets up the node label
     * @method setUpLabel
     * @param oData string containing the label, or an object with a label property
     */
    setUpLabel: function(oData) { 
        
        if (oData.style) {
            this.labelStyle = oData.style;
        }

        this.labelElId = "ygtvlabelel" + this.index;
		
    },

    /**
     * Returns the label element
     * @for YAHOO.widget.TextNode
     * @method getLabelEl
     * @return {object} the element
     */
    getLabelEl: function() { 
        return Dom.get(this.labelElId);
    },

    // overrides YAHOO.widget.Node
	getContentHtml: function() { 
        var sb = [];
        sb[sb.length] = this.href?'<a':'<span';
        sb[sb.length] = ' id="' + this.labelElId + '"';
        if (this.title) {
            sb[sb.length] = ' title="' + this.title + '"';
        }
        sb[sb.length] = ' class="' + this.labelStyle  + '"';
		if (this.href) {
			sb[sb.length] = ' href="' + this.href + '"';
			sb[sb.length] = ' target="' + this.target + '"';
		} 
        sb[sb.length] = ' >';
        sb[sb.length] = this.label;
        sb[sb.length] = this.href?'</a>':'</span>';
        return sb.join("");
    },



  /**
     * Returns an object which could be used to build a tree out of this node and its children.
     * It can be passed to the tree constructor to reproduce this node as a tree.
     * It will return false if any node loads dynamically, regardless of whether it is loaded or not.
     * @method getNodeDefinition
     * @return {Object | false}  definition of the tree or false if any node is defined as dynamic
     */
    getNodeDefinition: function() {
		var def = YAHOO.widget.TextNode.superclass.getNodeDefinition.call(this);
		if (def === false) { return false; }
		def.label = this.label;
		
		if (this.labelStyle != 'ygtvlabel') { def.style = this.labelStyle; }
		if (this.title) { def.title = this.title ; }
		return def;
	
	},

    toString: function() { 
        return "TextNode (" + this.index + ") " + this.label;
    }
});
})();