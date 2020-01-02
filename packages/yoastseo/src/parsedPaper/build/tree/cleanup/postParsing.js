import { LeafNode } from "../../../structure/tree";
import Ignored from "../../../structure/tree/nodes/Ignored";
import calculateTextIndices from "./calculateTextIndices";
import getElementContent from "./getElementContent";

/**
 * Calculates the start and end index of the given node or formatting element,
 * based on its source code location as parsed by `parse5`.
 *
 * @param {module:parsedPaper/structure.Node|module:parsedPaper/structure.FormattingElement} element  The element to set the start and end index of
 *
 * @returns {void}
 *
 * @private
 */
const calculateSourceIndices = function( element ) {
	if ( element.location ) {
		element.sourceStartIndex = element.location.startOffset;
		element.sourceEndIndex = element.location.endOffset;
	}
};

/**
 * Deletes parameters from the element that are used during parsing,
 * but are not needed for analysis.
 *
 * @param {Object} element  The element to delete parameters of.
 *
 * @returns {void}
 *
 * @private
 */
const deleteParseParameters = function( element ) {
	delete element.location;
	delete element.namespace;
	delete element.tagName;
	delete element.documentMode;
};

/**
 * Cleans up a node in the tree.
 *
 * @param {module:parsedPaper/structure.Node} node The node that needs to be cleaned.
 * @param {string} html                     The original html source code from which the node has been parsed.
 *
 * @returns {module:parsedPaper/structure.Node} The cleaned up node.
 *
 * @private
 */
const cleanUpNode = function( node, html ) {
	// Set content of ignored node, based on original source code.
	if ( node instanceof Ignored ) {
		node.content = getElementContent( node, html );
	}

	// Clean up formatting elements in headings and paragraphs.
	if ( node instanceof LeafNode ) {
		// Start and end position in leaf node's (header's or paragraph's) text without formatting.
		calculateTextIndices( node, html );
		node.textContainer.formatting = node.textContainer.formatting.map( element => {
			// Start and end position in text **with** formatting.
			calculateSourceIndices( element );
			deleteParseParameters( element );

			return element;
		} );
	}

	calculateSourceIndices( node );
	deleteParseParameters( node );

	return node;
};

/**
 * Cleans up the given tree after parsing of the HTML source code.
 *
 * These steps are setting the start and end index of each node and
 * deleting attributes needed for parsing, but not needed for further analysis.
 *
 * @param {module:parsedPaper/structure.Node} tree The tree structure to be cleaned.
 * @param {string} html                     The original HTML source code.
 *
 * @returns {module:parsedPaper/structure.Node} The cleaned up tree.
 *
 * @private
 */
const cleanUpTree = function( tree, html ) {
	tree.map( node => cleanUpNode( node, html ) );
	return tree;
};

export default cleanUpTree;
