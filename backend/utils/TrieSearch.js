/**
 * Trie Data Structure for Prefix Search
 * Optimized for fast location and keyword searching
 */

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.locations = new Set(); // Store unique locations at this node
  }
}

class TrieSearch {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Insert a word/phrase into the Trie
   * @param {string} word - The word to insert
   */
  insert(word) {
    if (!word || typeof word !== 'string') return;
    
    let node = this.root;
    const normalizedWord = word.toLowerCase().trim();
    
    for (const char of normalizedWord) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
      node.locations.add(normalizedWord);
    }
    node.isEndOfWord = true;
  }

  /**
   * Search for all words starting with a given prefix
   * @param {string} prefix - The prefix to search for
   * @returns {Array<string>} - Array of matching words
   */
  searchPrefix(prefix) {
    if (!prefix || typeof prefix !== 'string') return [];
    
    let node = this.root;
    const normalizedPrefix = prefix.toLowerCase().trim();
    
    // Traverse to the end of the prefix
    for (const char of normalizedPrefix) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    
    // Collect all words starting from this node
    const results = new Set();
    this._dfs(node, results);
    
    return Array.from(results).sort();
  }

  /**
   * Depth-first search to collect all words from a node
   * @private
   */
  _dfs(node, results) {
    if (!node) return;
    
    // Add all locations stored at this node
    node.locations.forEach(location => results.add(location));
    
    // Continue DFS to children
    for (const child of Object.values(node.children)) {
      this._dfs(child, results);
    }
  }

  /**
   * Get suggestions based on partial input
   * @param {string} input - Partial input
   * @param {number} limit - Maximum number of suggestions
   * @returns {Array<string>} - Array of suggestions
   */
  getSuggestions(input, limit = 10) {
    const matches = this.searchPrefix(input);
    return matches.slice(0, limit);
  }

  /**
   * Clear all data from the Trie
   */
  clear() {
    this.root = new TrieNode();
  }

  /**
   * Get all words in the Trie
   * @returns {Array<string>} - Array of all words
   */
  getAllWords() {
    const results = new Set();
    this._dfs(this.root, results);
    return Array.from(results).sort();
  }
}

export default TrieSearch;
