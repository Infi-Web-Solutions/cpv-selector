/**
* Utility functions for working with tree data structures
*/

/**
* Normalizes a string for case-insensitive, accent-insensitive comparison
* @param {string} str - The string to normalize
* @returns {string} - Normalized string
*/
export const normalizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    try {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    } catch (e) {
    // Fallback if normalize is not supported or fails
    return String(str).toLowerCase();
    }
    };
    
    /**
    * Checks if a node matches the search term
    * @param {Object} node - The node to check
    * @param {string} searchTerm - The normalized search term
    * @returns {boolean} - Whether the node matches
    */
    export const nodeMatchesSearch = (node, searchTerm) => {
    if (!searchTerm) return true;
    if (!node) return false;
    
    const normalizedCode = normalizeString(node.code || '');
    const normalizedDescription = normalizeString(node.description || '');
    
    return normalizedCode.includes(searchTerm) || 
    normalizedDescription.includes(searchTerm);
    };
    
    /**
    * Finds all nodes in a tree that match a search term
    * @param {Array} nodes - Array of tree nodes
    * @param {string} searchTerm - The search term
    * @returns {Object} - Object with matching nodes and their paths
    */
    export const findMatchingNodes = (nodes, searchTerm) => {
    if (!searchTerm || !nodes?.length) return { matches: [], paths: new Set() };
    
    const normalizedSearchTerm = normalizeString(searchTerm);
    const matches = [];
    const paths = new Set();
    
    const traverse = (node, currentPath = []) => {
    if (!node) return false;
    
    const nodePath = [...currentPath, node.code];
    const isMatch = nodeMatchesSearch(node, normalizedSearchTerm);
    
    if (isMatch) {
    matches.push(node);
    nodePath.forEach(code => paths.add(code));
    return true;
    }
    
    if (node.children?.length) {
    const hasMatchingChild = node.children.some(child => 
    traverse(child, nodePath)
    );
    
    if (hasMatchingChild) {
    nodePath.forEach(code => paths.add(code));
    return true;
    }
    }
    
    return false;
    };
    
    nodes.forEach(node => traverse(node));
    
    return { matches, paths };
    };
    
    /**
    * Gets all descendant codes from a node
    * @param {Object} node - The parent node
    * @returns {Array} - Array of descendant codes
    */
    export const getAllDescendantCodes = (node) => {
    if (!node) return [];
    
    const codes = [node.code];
    
    if (node.children?.length) {
    node.children.forEach(child => {
    codes.push(...getAllDescendantCodes(child));
    });
    }
    
    return codes;
    };
    
    /**
    * Checks if all children of a node are selected
    * @param {Object} node - The parent node
    * @param {Set} selectedCodes - Set of selected codes
    * @returns {boolean} - Whether all children are selected
    */
    export const areAllChildrenSelected = (node, selectedCodes) => {
    if (!node?.children?.length || !selectedCodes?.size) return false;
    
    return node.children.every(child => {
    if (child.children?.length) {
    return areAllChildrenSelected(child, selectedCodes);
    }
    return selectedCodes.has(child.code);
    });
    };
    
    /**
    * Checks if any children of a node are selected
    * @param {Object} node - The parent node
    * @param {Set} selectedCodes - Set of selected codes
    * @returns {boolean} - Whether any children are selected
    */
    export const areAnyChildrenSelected = (node, selectedCodes) => {
    if (!node?.children?.length || !selectedCodes?.size) return false;
    
    return node.children.some(child => {
    if (selectedCodes.has(child.code)) return true;
    if (child.children?.length) {
    return areAnyChildrenSelected(child, selectedCodes);
    }
    return false;
    });
    };
    
    /**
    * Finds a node by its code in the tree
    * @param {Array} nodes - Array of tree nodes
    * @param {string} code - The code to find
    * @returns {Object|null} - The found node or null
    */
    export const findNodeByCode = (nodes, code) => {
    if (!nodes?.length || !code) return null;
    
    for (const node of nodes) {
    if (node.code === code) return node;
    
    if (node.children?.length) {
    const found = findNodeByCode(node.children, code);
    if (found) return found;
    }
    }
    
    return null;
    };
    
    /**
    * Gets the selection state of a node
    * @param {Object} node - The node to check
    * @param {Set} selectedCodes - Set of selected codes
    * @returns {string} - 'checked', 'indeterminate', or 'unchecked'
    */
    export const getNodeSelectionState = (node, selectedCodes) => {
    if (!node || !selectedCodes) return 'unchecked';
    
    if (selectedCodes.has(node.code)) return 'checked';
    
    if (node.children?.length) {
    if (areAllChildrenSelected(node, selectedCodes)) return 'checked';
    if (areAnyChildrenSelected(node, selectedCodes)) return 'indeterminate';
    }
    
    return 'unchecked';
    };