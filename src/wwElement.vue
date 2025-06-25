<template>
  <div class="cpv-tree-selector" :style="colorConfig">
    <!-- 
      Button height can be configured via content.triggerHeight
      Examples: '44px', '60px', 'auto' (for dynamic height)
      If not set, defaults to auto with 44px min-height
    -->
    <button
      class="cpv-tree-selector__trigger"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      ref="triggerRef"
      :style="{
        backgroundColor: content.triggerBackgroundColor || '#FFFFFF',
        color: content.triggerTextColor || '#000000',
        height: content.triggerHeight || 'auto',
        minHeight: content.triggerHeight ? 'unset' : '44px'
      }"
    >
      <div class="cpv-tree-selector__trigger-content">
        <span class="cpv-tree-selector__trigger-label">{{ content.triggerLabel || 'Select CPV Codes' }}</span>
        <span v-if="selectedNodes.length > 0" class="cpv-tree-selector__trigger-count">
          ({{ selectedNodes.length }})
        </span>
      </div>
      <div class="cpv-tree-selector__trigger-icon" v-html="isOpen ? chevronUpIcon : chevronDownIcon"></div>
    </button>

    <div
      v-if="isOpen"
      class="cpv-tree-selector__dropdown"
      ref="dropdownRef"
      @keydown.esc="closeDropdown"
      :style="{ maxHeight: content.maxDropdownHeight || 'auto' }"
    >
      <div class="cpv-tree-selector__search">
        <SearchInput
          v-if="searchInputComponent"
          v-model="searchTerm"
          :placeholder="content.searchPlaceholder || 'Search CPV codes...'"
          :debounce-time="250"
        />
        <input 
          v-else
          v-model="searchTerm"
          type="text"
          :placeholder="content.searchPlaceholder || 'Search CPV codes...'"
          class="cpv-tree-selector__search-input"
        />
      </div>

      <div class="cpv-tree-selector__tree">
        <div v-if="isLoading" class="cpv-tree-selector__loading">
          Searching...
        </div>
        <div v-else-if="filteredTreeData.length === 0" class="cpv-tree-selector__empty">
          {{ throttledSearchTerm ? 'No matching CPV codes found' : 'No CPV data available' }}
        </div>
        <template v-else>
          <template v-if="useVirtualization && virtualizedTreeComponent">
            <VirtualizedTreeList
              :nodes="filteredTreeData"
              :expanded-nodes="expandedNodes"
              :selected-codes="selectedCodes"
              :search-paths="searchPaths"
              :search-term="searchTerm"
              :is-editing="isEditing"
              @toggle-expand="toggleNodeExpansion"
              @toggle-select="toggleNodeSelection"
            />
          </template>
          <template v-else-if="treeNodeComponent">
            <TreeNode
              v-for="node in filteredTreeData"
              :key="node.code"
              :node="node"
              :depth="0"
              :expanded-nodes="expandedNodes"
              :selected-codes="selectedCodes"
              :search-paths="searchPaths"
              :search-term="searchTerm"
              :is-editing="isEditing"
              @toggle-expand="toggleNodeExpansion"
              @toggle-select="toggleNodeSelection"
            />
          </template>
          <template v-else>
            <div 
              v-for="node in filteredTreeData" 
              :key="node.code"
              class="cpv-tree-selector__node"
            >
              <div class="cpv-tree-selector__node-content" :style="{ paddingLeft: '0px', display: 'flex', alignItems: 'center', minHeight: '36px', cursor: 'pointer', borderRadius: '4px', transition: 'background-color 0.15s ease' }">
                <button 
                  v-if="node.children && node.children.length > 0"
                  @click="toggleNodeExpansion(node.code)"
                  class="cpv-tree-selector__expand-btn"
                  :aria-expanded="expandedNodes.has(node.code)"
                  :aria-label="expandedNodes.has(node.code) ? 'Collapse' : 'Expand'"
                >
                  {{ expandedNodes.has(node.code) ? '−' : '+' }}
                </button>
                <span v-else class="cpv-tree-selector__spacer"></span>
                
                <input 
                  type="checkbox"
                  :checked="selectedCodes.has(node.code)"
                  @change="toggleNodeSelection(node)"
                  class="cpv-tree-selector__checkbox"
                  :id="`fallback-${node.code}`"
                />
                <label :for="`fallback-${node.code}`" class="cpv-tree-selector__node-label">
                  <span class="cpv-tree-selector__node-code">{{ node.code }}</span>
                  <span class="cpv-tree-selector__node-desc">{{ node.description }}</span>
                </label>
              </div>
              
              <!-- Render children for fallback -->
              <div v-if="node.children && node.children.length > 0 && expandedNodes.has(node.code)" class="cpv-tree-selector__children">
                <div 
                  v-for="child in node.children" 
                  :key="child.code"
                  class="cpv-tree-selector__node cpv-tree-selector__node--child"
                >
                  <div class="cpv-tree-selector__node-content" :style="{ paddingLeft: '24px', display: 'flex', alignItems: 'center', minHeight: '36px', cursor: 'pointer', borderRadius: '4px', transition: 'background-color 0.15s ease' }">
                    <button 
                      v-if="child.children && child.children.length > 0"
                      @click="toggleNodeExpansion(child.code)"
                      class="cpv-tree-selector__expand-btn"
                      :aria-expanded="expandedNodes.has(child.code)"
                      :aria-label="expandedNodes.has(child.code) ? 'Collapse' : 'Expand'"
                    >
                      {{ expandedNodes.has(child.code) ? '−' : '+' }}
                    </button>
                    <span v-else class="cpv-tree-selector__spacer"></span>
                    
                    <input 
                      type="checkbox"
                      :checked="selectedCodes.has(child.code)"
                      @change="toggleNodeSelection(child)"
                      class="cpv-tree-selector__checkbox"
                      :id="`fallback-${child.code}`"
                    />
                    <label :for="`fallback-${child.code}`" class="cpv-tree-selector__node-label">
                      <span class="cpv-tree-selector__node-code">{{ child.code }}</span>
                      <span class="cpv-tree-selector__node-desc">{{ child.description }}</span>
                    </label>
                  </div>
                  
                  <!-- Render grandchildren for fallback -->
                  <div v-if="child.children && child.children.length > 0 && expandedNodes.has(child.code)" class="cpv-tree-selector__children">
                    <div 
                      v-for="grandchild in child.children" 
                      :key="grandchild.code"
                      class="cpv-tree-selector__node cpv-tree-selector__node--grandchild"
                    >
                      <div class="cpv-tree-selector__node-content" :style="{ paddingLeft: '48px', display: 'flex', alignItems: 'center', minHeight: '36px', cursor: 'pointer', borderRadius: '4px', transition: 'background-color 0.15s ease' }">
                        <span class="cpv-tree-selector__spacer"></span>
                        <input 
                          type="checkbox"
                          :checked="selectedCodes.has(grandchild.code)"
                          @change="toggleNodeSelection(grandchild)"
                          class="cpv-tree-selector__checkbox"
                          :id="`fallback-${grandchild.code}`"
                        />
                        <label :for="`fallback-${grandchild.code}`" class="cpv-tree-selector__node-label">
                          <span class="cpv-tree-selector__node-code">{{ grandchild.code }}</span>
                          <span class="cpv-tree-selector__node-desc">{{ grandchild.description }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <div v-if="selectedNodes.length > 0" class="cpv-tree-selector__selected-section">
        <h4 class="cpv-tree-selector__selected-title">Selected CPV Codes</h4>
        <div class="cpv-tree-selector__selected-badges">
          <div 
            v-for="node in selectedNodes" 
            :key="node.code" 
            class="cpv-tree-selector__badge"
          >
            <span class="cpv-tree-selector__badge-code">{{ node.code }}</span>
            <span class="cpv-tree-selector__badge-description">{{ node.description }}</span>
            <button 
              class="cpv-tree-selector__badge-remove" 
              @click.stop="toggleNodeSelection(node)"
              :aria-label="`Remove ${node.code}`"
              v-html="closeIcon || '×'"
            ></button>
          </div>
        </div>
        <button 
          class="cpv-tree-selector__clear-all" 
          @click="clearSelection"
        >
          Clear All
        </button>
      </div>

      <div class="cpv-tree-selector__footer">
        </div>
    </div>
  </div>
</template>

<script>
import './tree-global.css';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import TreeNode from './components/TreeNode.vue';
import VirtualizedTreeList from './components/VirtualizedTreeList.vue';
import SearchInput from './components/SearchInput.vue';
import SelectedBadges from './components/SelectedBadges.vue';

// Safe import with fallbacks
let findMatchingNodes, getAllDescendantCodes, findNodeByCode;
let debounce;

try {
  // Try to import lodash debounce
  debounce = require('lodash/debounce') || require('lodash').debounce;
} catch (error) {
  console.warn('Lodash not available, using fallback debounce');
  // Fallback debounce implementation
  debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
}

try {
  const treeUtils = require('./utils/treeUtils');
  findMatchingNodes = treeUtils.findMatchingNodes;
  getAllDescendantCodes = treeUtils.getAllDescendantCodes;
  findNodeByCode = treeUtils.findNodeByCode;
} catch (error) {
  console.warn('Tree utils not found, using fallback implementations');
  
  // Fallback implementations
  findMatchingNodes = (nodes, searchTerm) => {
    const matches = new Set();
    const paths = new Set();
    
    const searchNodes = (nodeList, path = []) => {
      nodeList.forEach(node => {
        const currentPath = [...path, node.code];
        const nodeMatches = node.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          node.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (nodeMatches) {
          matches.add(node.code);
          currentPath.forEach(code => paths.add(code));
        }
        
        if (node.children) {
          searchNodes(node.children, currentPath);
        }
      });
    };
    
    searchNodes(nodes);
    return { matches, paths };
  };
  
  getAllDescendantCodes = (node) => {
    const codes = [node.code];
    if (node.children) {
      node.children.forEach(child => {
        codes.push(...getAllDescendantCodes(child));
      });
    }
    return codes;
  };
  
  findNodeByCode = (nodes, code) => {
    console.log('🔍 findNodeByCode called with:', { code, nodesLength: nodes?.length });
    
    for (const node of nodes) {
      console.log('🔍 Checking node:', node.code, 'against:', code, 'match:', node.code === code);
      if (node.code === code) {
        console.log('✅ Found node:', node.code);
        return node;
      }
      if (node.children) {
        const found = findNodeByCode(node.children, code);
        if (found) return found;
      }
    }
    console.log('❌ Node not found for code:', code);
    return null;
  };
}

export default {
  name: 'CpvTreeSelector',
  components: {
    TreeNode,
    VirtualizedTreeList,
    SearchInput,
    SelectedBadges
  },
  props: {
    content: {
      type: Object,
      required: true,
      default: () => ({})
    },
    uid: {
      type: String,
      required: true
    },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: false, default: () => ({}) },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    // Flag to track if we're updating from props
    const isUpdatingFromProps = ref(false);

    // Component availability checks with better error handling
    const treeNodeComponent = ref(true);
    const virtualizedTreeComponent = ref(true);
    const searchInputComponent = ref(true);
    const selectedBadgesComponent = ref(true);

    // Editor state
    const isEditing = computed(() => {
      /* wwEditor:start */
      return props.wwEditorState?.isEditing || false;
      /* wwEditor:end */
      // eslint-disable-next-line no-unreachable
      return false;
    });

    // Component state
    const isOpen = ref(false);
    const isLoading = ref(true);
    const treeData = ref([]);
    const searchTerm = ref('');
    const expandedNodes = ref(new Set());
    const selectedCodes = ref(new Set());
    const searchPaths = ref(new Set());
    const triggerRef = ref(null);
    const dropdownRef = ref(null);
    const closeIcon = ref('×');

    // Icons with fallbacks
    const chevronDownIcon = ref('▼');
    const chevronUpIcon = ref('▲');

    // Track last emitted value to prevent duplicate events
    const lastEmittedValue = ref(null);
    const isInitialized = ref(false);
    const isEmitting = ref(false);
    const isTreeDataLoaded = ref(false);
    const hasEmittedOnce = ref(false); // Track if we've emitted at least once

    // Test function for direct emission (for debugging)
    const testEmitTrigger = (value) => {
      console.log('🧪 TEST: Direct emission attempt with:', value);
      emit('trigger-event', { 
        name: 'change', 
        event: { value } 
      });
    };

    // Debounced trigger event emission
    const debouncedEmitTrigger = debounce((value) => {
      console.log('🔍 Trigger attempt:', {
        valueLength: value?.length,
        isInitialized: isInitialized.value,
        isTreeDataLoaded: isTreeDataLoaded.value,
        isEmitting: isEmitting.value,
        lastEmittedValue: lastEmittedValue.value ? 'exists' : 'none',
        hasEmittedOnce: hasEmittedOnce.value
      });
      
      // Prevent duplicate emissions and rapid successive events
      const valueString = JSON.stringify(value);
      if (lastEmittedValue.value === valueString || isEmitting.value) {
        console.log('❌ Trigger blocked - duplicate or emitting');
        return;
      }
      
      // Prevent empty emissions during initialization only
      if (!isInitialized.value && (!value || value.length === 0)) {
        console.log('❌ Trigger blocked - not initialized and empty');
        return;
      }
      
      // Additional validation to ensure we have valid data
      if (!Array.isArray(value)) {
        console.warn('Invalid value type for trigger event:', typeof value);
        return;
      }
      
      // Allow empty emissions after initialization (for deselection)
      // Only prevent empty emissions during the very first load
      if (isInitialized.value && !hasEmittedOnce.value && (!value || value.length === 0)) {
        console.log('❌ Trigger blocked - first emission and empty');
        return;
      }
      
      console.log('✅ Emitting trigger event with', value.length, 'items');
      isEmitting.value = true;
      try {
        emit('trigger-event', { 
          name: 'change', 
          event: { value } 
        });
        lastEmittedValue.value = valueString;
        hasEmittedOnce.value = true; // Mark that we've emitted at least once
      } catch (error) {
        console.warn('❌ Could not emit trigger event:', error);
      } finally {
        // Reset flag after a short delay
        setTimeout(() => {
          isEmitting.value = false;
        }, 50);
      }
    }, 150); // 150ms debounce

    // Load icons safely
    const loadIcons = async () => {
      try {
        if (typeof wwLib !== 'undefined' && wwLib.useIcons) {
          const { getIcon } = wwLib.useIcons();
          chevronDownIcon.value = await getIcon('chevron-down') || '▼';
          chevronUpIcon.value = await getIcon('chevron-up') || '▲';
          closeIcon.value = await getIcon('x') || '×';
        }
      } catch (error) {
        console.warn('Could not load icons:', error);
        // Keep fallback values
      }
    };

    // Use computed for proper reactivity - WeWeb will handle variable binding
    const selectedNodes = computed(() => {
      console.log('🌳 selectedNodes computed recalculating...');
      console.log('📊 selectedCodes contents:', Array.from(selectedCodes.value));
      console.log('🌲 treeData length:', treeData.value.length);
      
      const nodes = Array.from(selectedCodes.value).map(codeOrObject => {
        // Handle both string codes and object codes (Proxy objects)
        let code;
        if (typeof codeOrObject === 'string') {
          code = codeOrObject;
        } else if (codeOrObject && typeof codeOrObject === 'object' && codeOrObject.code) {
          code = codeOrObject.code;
        } else {
          console.log('❌ Invalid code format:', codeOrObject);
          return null;
        }
        
        console.log('🔍 Looking for node with code:', code);
        const node = findNodeByCode(treeData.value, code);
        if (!node) {
          console.log('❌ Node not found for code:', code, 'treeData length:', treeData.value.length);
          // Let's also log the first few tree nodes to see what we have
          if (treeData.value.length > 0) {
            console.log('🌲 First few tree nodes:', treeData.value.slice(0, 3).map(n => n.code));
          }
        } else {
          console.log('✅ Found node:', node.code, node.description);
        }
        return node ? { code: node.code, description: node.description } : null;
      }).filter(Boolean);
      
      console.log('🌳 selectedNodes computed result:', {
        selectedCodesSize: selectedCodes.value.size,
        treeDataLength: treeData.value.length,
        foundNodesLength: nodes.length,
        firstFewCodes: Array.from(selectedCodes.value).slice(0, 3),
        missingNodes: selectedCodes.value.size - nodes.length,
        foundNodes: nodes.slice(0, 3).map(n => n.code)
      });
      
      return nodes;
    });

    // Use computed for proper reactivity - WeWeb will handle variable binding
    const selectedItems = computed(() => {
      const items = selectedNodes.value.map(node => ({
        code: node.code,
        description: node.description
      }));
      
      console.log('📦 selectedItems computed:', {
        inputNodesLength: selectedNodes.value.length,
        outputItemsLength: items.length
      });
      
      return items;
    });

    // Computed properties
    const useVirtualization = computed(() => {
      // Use virtualization more aggressively for Browse performance
      const hasLargeResultSet = (nodes) => {
        if (!Array.isArray(nodes)) return false;

        // Count total visible nodes (including expanded children)
        let totalNodes = 0;
        const countNodes = (nodeList, depth = 0) => {
          if (totalNodes > 50) return; // Early exit for performance
          nodeList.forEach(node => {
            totalNodes++;
            // Count expanded children
            if (node.children && expandedNodes.value.has(node.code) && totalNodes <= 50) {
              countNodes(node.children, depth + 1);
            }
          });
        };
        countNodes(nodes);

        // Lower threshold for better Browse performance
        return totalNodes > 25 || nodes.length > 15;
      };

      return hasLargeResultSet(filteredTreeData.value);
    });

    // Simple computed for selected codes array
    const selectedCodesArray = computed(() => {
      const codesArray = Array.from(selectedCodes.value);
      // console.log('💡 selectedCodesArray computed recalculated:', codesArray); // REMOVED LOG
      return codesArray;
    });

    // Optimized computed filtered tree data with memoization
    const filteredTreeData = computed(() => {
      if (!throttledSearchTerm.value || throttledSearchTerm.value.trim() === '') {
        return treeData.value;
      }

      // Cache the search term to avoid repeated processing
      const currentSearchTerm = throttledSearchTerm.value.trim().toLowerCase();

      // Inline search utilities for better performance
      const nodeMatchesSearch = (node, searchTerm) => {
        if (!searchTerm || !node) return false;
        const code = (node.code || '').toLowerCase();
        const description = (node.description || '').toLowerCase();
        return code.includes(searchTerm) || description.includes(searchTerm);
      };

      // Optimized recursive function with early returns
      const filterNodes = (nodes) => {
        if (!Array.isArray(nodes) || nodes.length === 0) return [];

        const result = [];

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const nodeMatches = nodeMatchesSearch(node, currentSearchTerm);
          const filteredChildren = node.children?.length ? filterNodes(node.children) : [];
          const hasMatchingChildren = filteredChildren.length > 0;

          if (nodeMatches || hasMatchingChildren) {
            result.push({
              ...node,
              children: filteredChildren
            });
          }
        }

        return result;
      };

      return filterNodes(treeData.value);
    });

    // Transform hierarchical JSON to tree structure
    const transformCpvJsonToTree = (cpvData) => {
      if (!cpvData || typeof cpvData !== 'object') {
        console.warn('Invalid CPV data provided');
        return [];
      }

      const treeNodes = [];

      try {
        // Level 1: Divisions (like "03", "09", etc.)
        Object.keys(cpvData).forEach(divisionKey => {
          const division = cpvData[divisionKey];
          if (!division || !division.code) return;

          const divisionNode = {
            code: division.code,
            description: division.description || '',
            children: []
          };

          // Level 2: Groups (like "031", "032", etc.)
          if (division.groups) {
            Object.keys(division.groups).forEach(groupKey => {
              const group = division.groups[groupKey];
              if (!group || !group.code) return;

              const groupNode = {
                code: group.code,
                description: group.description || '',
                children: []
              };

              // Level 3: Classes (like "0311", "0312", etc.)
              if (group.classes) {
                Object.keys(group.classes).forEach(classKey => {
                  const classItem = group.classes[classKey];
                  if (!classItem || !classItem.code) return;

                  const classNode = {
                    code: classItem.code,
                    description: classItem.description || '',
                    children: []
                  };

                  // Level 4: Categories (like "03111", "03112", etc.)
                  if (classItem.categories) {
                    Object.keys(classItem.categories).forEach(categoryKey => {
                      const category = classItem.categories[categoryKey];
                      if (!category || !category.code) return;

                      const categoryNode = {
                        code: category.code,
                        description: category.description || '',
                        children: []
                      };

                      // Level 5: Subcategories (like "03111100", "03111200", etc.)
                      if (category.subcategories) {
                        Object.keys(category.subcategories).forEach(subcategoryKey => {
                          const subcategory = category.subcategories[subcategoryKey];
                          if (!subcategory || !subcategory.code) return;

                          const subcategoryNode = {
                            code: subcategory.code,
                            description: subcategory.description || '',
                            children: [] // Leaf nodes
                          };

                          categoryNode.children.push(subcategoryNode);
                        });
                      }

                      classNode.children.push(categoryNode);
                    });
                  }

                  groupNode.children.push(classNode);
                });
              }

              divisionNode.children.push(groupNode);
            });
          }

          treeNodes.push(divisionNode);
        });
      } catch (error) {
        console.error('Error transforming CPV data:', error);
        return [];
      }

      return treeNodes;
    };

    // Get CPV data from bound properties
    const getStaticCpvData = () => {
      try {
        console.log('📊 getStaticCpvData called');
        
        // Try cpvStructure property first
        let cpvData = props.content?.cpvStructure;
        console.log('📊 cpvStructure data:', {
          exists: !!cpvData,
          keys: cpvData ? Object.keys(cpvData) : [],
          sampleData: cpvData ? Object.keys(cpvData).slice(0, 2).map(key => ({ key, hasCode: !!cpvData[key]?.code })) : []
        });

        // Fallback to cpvCollection property
        if (!cpvData || Object.keys(cpvData || {}).length === 0) {
          cpvData = props.content?.cpvCollection;
          console.log('📊 Using cpvCollection fallback:', {
            exists: !!cpvData,
            keys: cpvData ? Object.keys(cpvData) : []
          });
        }

        if (!cpvData || Object.keys(cpvData || {}).length === 0) {
          console.warn('No CPV data found');
          return [];
        }

        // Transform the nested JSON into tree structure
        const transformedData = transformCpvJsonToTree(cpvData);
        console.log('📊 Transformation result:', {
          inputKeys: Object.keys(cpvData),
          outputDivisions: transformedData.length,
          sampleOutput: transformedData.slice(0, 2).map(d => ({ code: d.code, childrenCount: d.children?.length }))
        });

        return transformedData;

      } catch (error) {
        console.error('Error processing CPV data:', error);
        return [];
      }
    };

    const loadTreeData = async () => {
      console.log('📂 Loading tree data...');
      console.log('📊 Content props:', {
        hasCpvStructure: !!props.content?.cpvStructure,
        hasCpvCollection: !!props.content?.cpvCollection,
        cpvStructureKeys: props.content?.cpvStructure ? Object.keys(props.content.cpvStructure) : [],
        cpvCollectionKeys: props.content?.cpvCollection ? Object.keys(props.content.cpvCollection) : []
      });
      
      isLoading.value = true;
      try {
        await nextTick(); // Ensure DOM is ready
        const data = getStaticCpvData();
        console.log('📊 Transformed tree data:', {
          divisionsCount: data.length,
          firstDivision: data[0] ? { code: data[0].code, description: data[0].description, childrenCount: data[0].children?.length } : null,
          sampleCodes: data.slice(0, 3).map(d => d.code)
        });
        treeData.value = data;
        isTreeDataLoaded.value = true;
        console.log('✅ Tree data loaded:', data.length, 'divisions');
      } catch (error) {
        console.error('Error in loadTreeData:', error);
        treeData.value = [];
        isTreeDataLoaded.value = true; // Set to true even on error to prevent blocking
        console.log('⚠️ Tree data loaded with error');
      } finally {
        isLoading.value = false;
      }
    };

    const toggleDropdown = () => {
      if (isEditing.value) return;
      if (isOpen.value) {
        closeDropdown();
      } else {
        openDropdown();
      }
    };

    const openDropdown = () => {
      if (isEditing.value) return;
      isOpen.value = true;
      nextTick(() => {
        document.addEventListener('click', handleOutsideClick);
      });
    };

    const closeDropdown = () => {
      isOpen.value = false;
      document.removeEventListener('click', handleOutsideClick);
    };

    const handleOutsideClick = (event) => {
      if (
        !isEditing.value &&
        isOpen.value &&
        triggerRef.value &&
        dropdownRef.value &&
        !triggerRef.value.contains(event.target) &&
        !dropdownRef.value.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    // Function to clean up selectedCodes to ensure only string codes
    const cleanupSelectedCodes = () => {
      const cleanedCodes = new Set();
      let hasObjectCodes = false;
      
      Array.from(selectedCodes.value).forEach(codeOrObject => {
        if (typeof codeOrObject === 'string') {
          cleanedCodes.add(codeOrObject);
        } else if (codeOrObject && typeof codeOrObject === 'object' && codeOrObject.code) {
          cleanedCodes.add(codeOrObject.code);
          hasObjectCodes = true;
        } else {
          console.log('❌ Invalid code format:', codeOrObject);
        }
      });
      
      // Only update if we actually found object codes that needed cleaning
      if (hasObjectCodes) {
        console.log('🧹 Cleaned selectedCodes:', {
          before: selectedCodes.value.size,
          after: cleanedCodes.size
        });
        selectedCodes.value = cleanedCodes;
      }
    };

    const toggleNodeSelection = (node) => {
      if (!node || isEditing.value) return;

      console.log('🎯 toggleNodeSelection called for:', node.code);

      const newSelectedCodes = new Set(selectedCodes.value);
      const isCurrentlySelected = newSelectedCodes.has(node.code);

      console.log('📊 Before toggle - selected count:', newSelectedCodes.size, 'isSelected:', isCurrentlySelected);

      // Toggle the node itself
      if (isCurrentlySelected) {
        newSelectedCodes.delete(node.code);
        console.log('❌ DESELECTED:', node.code);
      } else {
        newSelectedCodes.add(node.code);
        console.log('✅ SELECTED:', node.code);
      }

      // Handle children if present
      if (node.children?.length) {
        const descendantCodes = getAllDescendantCodes(node);
        const childCodes = descendantCodes.filter(code => code !== node.code);

        if (isCurrentlySelected) {
          // Deselect all descendants
          childCodes.forEach(code => newSelectedCodes.delete(code));
          console.log('❌ DESELECTED descendants:', childCodes.length);
        } else {
          // Select all descendants
          childCodes.forEach(code => newSelectedCodes.add(code));
          console.log('✅ SELECTED descendants:', childCodes.length);
        }
      }

      // Update the selection
      selectedCodes.value = new Set(newSelectedCodes);
      console.log('📊 After toggle - selected count:', selectedCodes.value.size, 'will trigger watcher:', !isEditing.value);
      
      // Test direct emission for deselection
      if (isCurrentlySelected && !isEditing.value) {
        console.log('🧪 TEST: Direct emission for deselection');
        nextTick(() => {
          testEmitTrigger(selectedItems.value);
        });
      }
    };

    const toggleNodeExpansion = (nodeCode) => {
      console.log('🔄 toggleNodeExpansion called for:', nodeCode);
      
      // Use nextTick for smooth expansion
      nextTick(() => {
        const newExpandedNodes = new Set(expandedNodes.value);
        if (newExpandedNodes.has(nodeCode)) {
          newExpandedNodes.delete(nodeCode);
          console.log('❌ Collapsed node:', nodeCode);
        } else {
          newExpandedNodes.add(nodeCode);
          console.log('✅ Expanded node:', nodeCode);
        }
        expandedNodes.value = newExpandedNodes;
        
        // Force a re-render to ensure children are properly displayed
        nextTick(() => {
          console.log('🔄 Expanded nodes after toggle:', Array.from(expandedNodes.value));
        });
      });
    };

    const clearSelection = () => {
      console.log('🧹 Clear All button clicked');
      console.log('📊 Before clear - selected count:', selectedCodes.value.size);
      
      // Clear the selection
      selectedCodes.value = new Set();
      
      console.log('📊 After clear - selected count:', selectedCodes.value.size);
      
      // Reset emission tracking for clear operation
      // Don't reset hasEmittedOnce since we want to allow empty emissions
      lastEmittedValue.value = null;

      console.log('🔄 Emitting clear trigger event');
      // Emit trigger event for clearing selection
      debouncedEmitTrigger([]);
    };

    // Optimized search handling with better performance
    const debouncedSearch = debounce((term) => {
      if (!term || term.trim() === '') {
        searchPaths.value = new Set();
        return;
      }

      // Use nextTick to avoid blocking the UI
      nextTick(() => {
        const { paths } = findMatchingNodes(treeData.value, term);
        searchPaths.value = paths;

        // Auto-expand nodes that contain matches (throttled)
        const newExpandedNodes = new Set(expandedNodes.value);
        paths.forEach(code => {
          newExpandedNodes.add(code);
        });
        expandedNodes.value = newExpandedNodes;
      });
    }, 300); // Increased debounce time from 250ms to 300ms

    // Throttled search term to reduce rendering frequency
    const throttledSearchTerm = ref('');

    // Watch for search term changes with throttling
    watch(searchTerm, (newTerm) => {
      isLoading.value = true; // Start loading

      if (!newTerm || newTerm.trim() === '') {
        throttledSearchTerm.value = '';
        searchPaths.value = new Set();
        expandedNodes.value = new Set(); // Collapse all nodes when search is cleared
        setTimeout(() => {
          isLoading.value = false; // End loading for empty search
        }, 200); // Short delay for UX
        return;
      }

      debouncedSearch(newTerm);

      setTimeout(() => {
        throttledSearchTerm.value = newTerm;
        isLoading.value = false; // End loading after debounce
      }, 350); // Match your debounce time
    });

    // IMPROVED EVENT HANDLING - Watch to update WeWeb variable
    watch(selectedCodes, (newCodes, oldCodes) => {
      console.log('👀 selectedCodes watcher triggered:', {
        newCodesSize: newCodes?.size,
        oldCodesSize: oldCodes?.size,
        isEditing: isEditing.value,
        isInitialized: isInitialized.value,
        isTreeDataLoaded: isTreeDataLoaded.value,
        treeDataLength: treeData.value.length
      });
      
      // Skip if component is in edit mode
      if (isEditing.value) {
        console.log('❌ Watcher blocked - editing mode');
        return;
      }
      
      // Skip if the change is just a reference change but content is the same
      if (oldCodes && newCodes && oldCodes.size === newCodes.size) {
        const oldArray = Array.from(oldCodes).sort();
        const newArray = Array.from(newCodes).sort();
        const isSameContent = oldArray.length === newArray.length && 
                             oldArray.every((code, index) => code === newArray[index]);
        if (isSameContent) {
          console.log('❌ Watcher blocked - same content, different reference');
          return;
        }
      }
      
      // Only emit after initialization and tree data loading to prevent initial empty events
      if (isInitialized.value && isTreeDataLoaded.value) {
        console.log('✅ Watcher proceeding - calling debouncedEmitTrigger');
        // Use nextTick to ensure selectedItems is updated
        nextTick(() => {
          debouncedEmitTrigger(selectedItems.value);
        });
      } else {
        console.log('❌ Watcher blocked - not ready:', {
          isInitialized: isInitialized.value,
          isTreeDataLoaded: isTreeDataLoaded.value
        });
      }
    }, { immediate: false, deep: true });

    // Watch for tree data loading to emit initial event
    watch(isTreeDataLoaded, (loaded) => {
      console.log('🌳 Tree data loading watcher:', {
        loaded,
        isInitialized: isInitialized.value,
        hasLastEmitted: !!lastEmittedValue.value
      });
      
      if (loaded && isInitialized.value && !lastEmittedValue.value) {
        console.log('✅ Tree data loaded - emitting initial event');
        nextTick(() => {
          debouncedEmitTrigger(selectedItems.value);
        });
      }
    });

    // Watch for property changes
    watch(() => props.content?.cpvStructure, () => {
      loadTreeData();
    }, { deep: true });

    watch(() => props.content?.cpvCollection, () => {
      loadTreeData();
    }, { deep: true });

    // Watch for bound selectedCpvCodes changes (for initialization only)
    watch(() => props.content?.selectedCpvCodes, (newCodes, oldCodes) => {
      // Skip if we're updating from internal changes or not initialized
      if (isUpdatingFromProps.value || !isInitialized.value) return;

      // Only process if it's actually different from current selection
      const currentCodes = Array.from(selectedCodes.value).sort();
      const incomingCodes = Array.isArray(newCodes) ? newCodes.sort() : [];

      // Check if arrays are actually different
      const isDifferent = currentCodes.length !== incomingCodes.length || 
                         currentCodes.some((code, index) => code !== incomingCodes[index]);

      if (isDifferent && Array.isArray(newCodes)) {
        isUpdatingFromProps.value = true;
        const codes = new Set(newCodes.filter(Boolean));
        selectedCodes.value = codes;
        cleanupSelectedCodes(); // Clean up to ensure only string codes
        nextTick(() => {
          isUpdatingFromProps.value = false;
        });
      }
    }, { immediate: false });

    // Watch for initialValue changes (component initialization only)
    watch(() => props.content?.initialValue, (newValue) => {
      // Skip if not initialized to prevent duplicate events
      if (!isInitialized.value) return;
      
      if (Array.isArray(newValue) && newValue.length > 0) {
        const codes = new Set(newValue.map(item => item.code).filter(Boolean));
        selectedCodes.value = codes;
        cleanupSelectedCodes(); // Clean up to ensure only string codes
      }
    }, { immediate: false });

    // Initialize
    onMounted(async () => {
      console.log('🚀 Component mounting...');
      
      await loadIcons();
      await loadTreeData();

      // Initialize selection from component properties - ONE TIME ONLY
      let initialCodes = new Set();

      // 1. Check bound selectedCpvCodes property first
      if (Array.isArray(props.content?.selectedCpvCodes) && props.content.selectedCpvCodes.length > 0) {
        initialCodes = new Set(props.content.selectedCpvCodes);
      }
      // 2. Check defaultSelectedCodes property
      else if (Array.isArray(props.content?.defaultSelectedCodes) && props.content.defaultSelectedCodes.length > 0) {
        initialCodes = new Set(props.content.defaultSelectedCodes);
      }
      // 3. Check initialValue property
      else if (Array.isArray(props.content?.initialValue) && props.content.initialValue.length > 0) {
        initialCodes = new Set(props.content.initialValue.map(item => item.code).filter(Boolean));
      }

      // Apply initial selection
      if (initialCodes.size > 0) {
        selectedCodes.value = initialCodes;
        cleanupSelectedCodes(); // Clean up to ensure only string codes
      }

      // Mark as initialized
      isInitialized.value = true;
      console.log('🚀 Component initialized');

      // Emit initial trigger event after tree data is loaded and everything is ready
      if (isTreeDataLoaded.value) {
        console.log('✅ Tree data already loaded - emitting initial event');
        nextTick(() => {
          debouncedEmitTrigger(selectedItems.value);
        });
      } else {
        console.log('⏳ Waiting for tree data to load before initial event');
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick);
    });

    return {
      isOpen,
      isLoading,
      treeData,
      filteredTreeData,
      searchTerm,
      throttledSearchTerm,
      expandedNodes,
      selectedCodes,
      selectedCodesArray,
      searchPaths,
      selectedNodes,
      selectedItems, // For WeWeb variable binding (full objects)
      useVirtualization,
      triggerRef,
      dropdownRef,
      chevronDownIcon,
      chevronUpIcon,
      closeIcon,
      isEditing,
      treeNodeComponent,
      virtualizedTreeComponent,
      searchInputComponent,
      selectedBadgesComponent,
      toggleDropdown,
      openDropdown,
      closeDropdown,
      toggleNodeExpansion,
      toggleNodeSelection,
      clearSelection,
      testEmitTrigger, // For debugging
      checkComponentAvailability: () => {
        // This method is now empty as the component handles component availability internally
      },
      // REMOVED: testJavaScriptAccess,
      // REMOVED: getCurrentSelection,
      // REMOVED: setSelection,
      // Color configuration
      colorConfig: computed(() => {
        const accentColor = props.content.accentColor || '#4F46E5';
        const hexToRgba = (hex, alpha) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        return {
          '--primary-color': accentColor,
          '--primary-light': hexToRgba(accentColor, 0.1),
          '--primary-alpha': hexToRgba(accentColor, 0.2),
          '--selected-bg': hexToRgba(accentColor, 0.1),
          '--selected-border': accentColor,
          '--code-color': accentColor,
          '--badge-bg': '#f3f4f6',
          '--badge-border': '#e5e7eb', 
          '--badge-hover': '#e5e7eb',
          '--remove-hover': '#dc2626'
        };
      })
    };
  }
};
</script>

<style lang="scss">
/* Global styles for tree nodes - these need to be global for proper rendering */
.cpv-tree-selector {
  position: relative;
  width: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 12px;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    word-wrap: break-word;
    white-space: normal;

    &:hover {
      border-color: #d1d5db;
    }

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--primary-alpha);
    }

    &-content {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      min-width: 0;
      word-wrap: break-word;
      white-space: normal;
    }

    &-label {
      font-weight: 500;
      word-wrap: break-word;
      white-space: normal;
    }

    &-count {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-color);
      white-space: nowrap;
      flex-shrink: 0;
    }

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      flex-shrink: 0;
      margin-left: 8px;
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 50;
    display: flex;
    flex-direction: column;
    backface-visibility: hidden;
  }

  &__search {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;

    &-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }
  }

  &__tree {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
    min-height: 200px;
    max-height: 300px;
  }

  &__node {
    padding: 4px 8px;
    border-bottom: 1px solid #f3f4f6;

    &-content {
      display: flex;
      align-items: center;
      gap: 8px;
      transform: translateZ(0);
    }

    &-code {
      font-weight: 500;
      font-size: 12px;
      min-width: 80px;
    }

    &-desc {
      font-size: 12px;
      color: #6b7280;
    }

    &-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      flex: 1;
      overflow: hidden;
    }

    &--child {
      padding-left: 24px;
      border-left: 1px solid #e5e7eb;
      margin-left: 12px;
    }

    &--grandchild {
      padding-left: 24px;
      border-left: 1px solid #e5e7eb;
      margin-left: 12px;
    }
  }

  &__expand-btn {
    width: 20px;
    height: 20px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 2px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: #f9fafb;
    }
  }

  &__checkbox {
    width: 16px;
    height: 16px;
  }

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: #6b7280;
    font-size: 14px;
  }

  &__selected-section {
    margin-top: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px;
  }

  &__selected-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #374151;
  }

  &__selected-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    background-color: var(--badge-bg);
    border: 1px solid var(--badge-border);
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 12px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--badge-hover);
    }

    &-code {
      font-weight: 600;
      color: var(--code-color);
      margin-right: 6px;
      white-space: nowrap;
    }

    &-description {
      color: #374151;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 8px;
      flex: 1;
      min-width: 0;
    }

    &-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 2px;
      color: #6b7280;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      transition: all 0.2s;

      &:hover {
        background-color: var(--remove-hover);
        color: white;
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  &__clear-all {
    margin-top: 12px;
    padding: 6px 12px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }
}

/* Global tree node styles - these must be global for proper rendering */
.tree-node {
  position: relative;
  outline: none;
  contain: layout style;

  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
    border-radius: 4px;
  }

  &__content {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    min-height: 36px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-right: 4px;
    color: #6b7280;
    font-size: 12px;
    transition: background-color 0.15s ease;

    &:focus-visible {
      outline: 2px solid #4f46e5;
      border-radius: 4px;
    }

    &-text {
      font-family: monospace;
      font-size: 12px;
      line-height: 1;
    }
  }

  &__spacer {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  &__checkbox {
    margin-right: 8px;

    input {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    cursor: pointer;
    flex: 1;
    overflow: hidden;
  }

  &__code {
    font-weight: 500;
    margin-right: 8px;
    white-space: nowrap;
  }

  &__description {
    color: #4b5563;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__children {
    position: relative;
  }

  &--selected {
    > .tree-node__content {
      background-color: var(--primary-light);
    }
  }

  &--highlighted {
    > .tree-node__content {
      .tree-node__code,
      .tree-node__description {
        background-color: rgba(255, 213, 79, 0.3);
      }
    }
  }
}

/* Virtualized tree list styles */
.virtualized-tree-list {
  height: 100%;
  overflow-y: auto;
  
  &__inner {
    position: relative;
    width: 100%;
  }
}
</style>