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

/**
 * RoomListingSearcher - Search rooms by location, amenities, and name
 * Uses Trie for efficient prefix searching
 */
class RoomListingSearcher {
  constructor() {
    this.locationTrie = new TrieSearch();
    this.amenityTrie = new TrieSearch();
    this.nameTrie = new TrieSearch();
    this.rooms = new Map(); // Store room data by ID
  }

  /**
   * Index a room for searching
   * @param {Object} room - Room object with name, location, amenities
   */
  indexRoom(room) {
    if (!room || !room._id) return;

    // Store room data
    this.rooms.set(room._id, room);

    // Index room name
    if (room.name) {
      this.nameTrie.insert(room.name);
    }

    // Index location (city, district, area)
    if (room.location) {
      if (typeof room.location === 'string') {
        this.locationTrie.insert(room.location);
      } else if (room.location.city) {
        this.locationTrie.insert(room.location.city);
      }
      if (room.location.area) {
        this.locationTrie.insert(room.location.area);
      }
    }

    // Index amenities
    if (Array.isArray(room.amenities)) {
      for (const amenity of room.amenities) {
        if (typeof amenity === 'string') {
          this.amenityTrie.insert(amenity);
        } else if (amenity.name) {
          this.amenityTrie.insert(amenity.name);
        }
      }
    }
  }

  /**
   * Index multiple rooms
   * @param {Array} rooms - Array of room objects
   */
  indexRooms(rooms) {
    if (!Array.isArray(rooms)) return;
    for (const room of rooms) {
      this.indexRoom(room);
    }
  }

  /**
   * Search for rooms by location prefix
   * @param {string} locationPrefix - Location prefix to search
   * @returns {Array} - Matching rooms
   */
  searchByLocation(locationPrefix) {
    const matches = this.locationTrie.getSuggestions(locationPrefix);
    const results = [];

    for (const [roomId, room] of this.rooms) {
      const roomLocation = typeof room.location === 'string' 
        ? room.location 
        : (room.location?.city || '');
      
      if (matches.some(match => roomLocation.toLowerCase().includes(match))) {
        results.push(room);
      }
    }

    return results;
  }

  /**
   * Search for rooms by name prefix
   * @param {string} namePrefix - Name prefix to search
   * @returns {Array} - Matching rooms
   */
  searchByName(namePrefix) {
    const matches = this.nameTrie.getSuggestions(namePrefix);
    const results = [];

    for (const [roomId, room] of this.rooms) {
      if (matches.some(match => room.name?.toLowerCase().includes(match))) {
        results.push(room);
      }
    }

    return results;
  }

  /**
   * Search for rooms by amenity
   * @param {string} amenityPrefix - Amenity prefix to search
   * @returns {Array} - Matching rooms
   */
  searchByAmenity(amenityPrefix) {
    const matches = this.amenityTrie.getSuggestions(amenityPrefix);
    const results = [];

    for (const [roomId, room] of this.rooms) {
      if (Array.isArray(room.amenities)) {
        const hasAmenity = room.amenities.some(amenity => {
          const amenityStr = typeof amenity === 'string' ? amenity : amenity.name || '';
          return matches.some(match => amenityStr.toLowerCase().includes(match));
        });
        if (hasAmenity) {
          results.push(room);
        }
      }
    }

    return results;
  }

  /**
   * Combined search - search by location, name, and amenities
   * @param {string} query - Search query
   * @returns {Array} - Combined results
   */
  search(query) {
    if (!query || typeof query !== 'string') return [];

    const normalizedQuery = query.toLowerCase().trim();
    const locationResults = this.searchByLocation(normalizedQuery);
    const nameResults = this.searchByName(normalizedQuery);
    const amenityResults = this.searchByAmenity(normalizedQuery);

    // Combine results, removing duplicates
    const allResults = new Map();
    
    for (const room of locationResults) {
      allResults.set(room._id, { ...room, matchType: 'location' });
    }
    for (const room of nameResults) {
      const existing = allResults.get(room._id);
      if (existing) {
        existing.matchTypes = (existing.matchTypes || [existing.matchType]).concat('name');
      } else {
        allResults.set(room._id, { ...room, matchType: 'name' });
      }
    }
    for (const room of amenityResults) {
      const existing = allResults.get(room._id);
      if (existing) {
        existing.matchTypes = (existing.matchTypes || [existing.matchType]).concat('amenity');
      } else {
        allResults.set(room._id, { ...room, matchType: 'amenity' });
      }
    }

    return Array.from(allResults.values());
  }

  /**
   * Get autocomplete suggestions
   * @param {string} query - Search query
   * @param {number} limit - Maximum suggestions
   * @returns {Object} - Suggestions object with locations, names, amenities
   */
  getAutocompleteSuggestions(query, limit = 5) {
    if (!query || typeof query !== 'string') {
      return { locations: [], names: [], amenities: [] };
    }

    return {
      locations: this.locationTrie.getSuggestions(query, limit),
      names: this.nameTrie.getSuggestions(query, limit),
      amenities: this.amenityTrie.getSuggestions(query, limit),
    };
  }

  /**
   * Clear all indexed data
   */
  clear() {
    this.locationTrie.clear();
    this.amenityTrie.clear();
    this.nameTrie.clear();
    this.rooms.clear();
  }
}

export { TrieSearch, RoomListingSearcher };
export default TrieSearch;
