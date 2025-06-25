<template>
    <div
      class="tree-node"
      :class="{
        'tree-node--expanded': isExpanded,
        'tree-node--selected': isSelected,
        'tree-node--highlighted': isHighlighted
      }"
      :aria-expanded="hasChildren ? String(isExpanded) : undefined"
      :aria-selected="isSelected"
      :tabindex="isSelectable ? 0 : -1"
      @click="handleNodeClick"
      @keydown="handleKeyDown"
    >
      <div class="tree-node__content" :style="getNodeContentStyle">
        <button
          v-if="hasChildren"
          class="tree-node__toggle"
          type="button"
          aria-label="Toggle node"
          @click.stop="toggleExpand"
        >
          <!-- Simple text arrows for better performance -->
          <span v-if="chevronDownIcon && chevronRightIcon" v-html="isExpanded ? chevronDownIcon : chevronRightIcon"></span>
          <span v-else class="tree-node__toggle-text">{{ isExpanded ? '▼' : '▶' }}</span>
        </button>
        <span v-else class="tree-node__spacer"></span>
  
        <div class="tree-node__checkbox">
          <input
    type="checkbox"
    :id="`node-${node.code}`"
    :checked="isSelected"
    :indeterminate="isIndeterminate"
    @change="toggleSelect"
  />
        </div>
  
        <label :for="`node-${node.code}`" class="tree-node__label">
          <span class="tree-node__code">{{ node.code }}</span>
          <span class="tree-node__description">{{ node.description }}</span>
        </label>
      </div>
  
      <!-- Simplified transition for better performance -->
      <div v-if="hasChildren && isExpanded" class="tree-node__children">
        <template v-if="shouldRenderChildren">
          <TreeNode
            v-for="child in node.children"
            :key="child.code"
            :node="child"
            :depth="depth + 1"
            :expanded-nodes="expandedNodes"
            :selected-codes="selectedCodes"
            :search-paths="searchPaths"
            :search-term="searchTerm"
            :is-editing="isEditing"
            @toggle-expand="$emit('toggle-expand', $event)"
            @toggle-select="$emit('toggle-select', $event)"
          />
        </template>
      </div>
    </div>
  </template>
  
  <script>
  import { computed, ref, watch, nextTick } from 'vue';
  
  // Fallback implementations for tree utilities
  const getNodeSelectionState = (node, selectedCodes) => {
    if (!node || !selectedCodes) return 'unchecked';
    
    if (selectedCodes.has(node.code)) return 'checked';
    
    if (node.children?.length) {
      const allChildrenSelected = node.children.every(child => {
        if (child.children?.length) {
          return getNodeSelectionState(child, selectedCodes) === 'checked';
        }
        return selectedCodes.has(child.code);
      });
      
      if (allChildrenSelected) return 'checked';
      
      const anyChildrenSelected = node.children.some(child => {
        if (child.children?.length) {
          return getNodeSelectionState(child, selectedCodes) !== 'unchecked';
        }
        return selectedCodes.has(child.code);
      });
      
      if (anyChildrenSelected) return 'indeterminate';
    }
    
    return 'unchecked';
  };
  
  const nodeMatchesSearch = (node, searchTerm) => {
    if (!searchTerm || !node) return false;
    const code = (node.code || '').toLowerCase();
    const description = (node.description || '').toLowerCase();
    return code.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
  };
  
  const normalizeString = (str) => str.toLowerCase().trim();
  
  export default {
    name: 'TreeNode',
    props: {
      node: {
        type: Object,
        required: true
      },
      depth: {
        type: Number,
        default: 0
      },
      expandedNodes: {
        type: Set,
        default: () => new Set()
      },
      selectedCodes: {
        type: Set,
        default: () => new Set()
      },
      searchPaths: {
        type: Set,
        default: () => new Set()
      },
      searchTerm: {
        type: String,
        default: ''
      },
      isEditing: {
        type: Boolean,
        default: false
      }
    },
    emits: ['toggle-expand', 'toggle-select'],
    setup(props, { emit }) {
      const shouldRenderChildren = ref(false);
  
      // Icons with fallback
      const chevronRightIcon = ref('');
      const chevronDownIcon = ref('');
  
      // Load icons with error handling
      const loadIcons = async () => {
        try {
          if (typeof wwLib !== 'undefined' && wwLib.useIcons) {
            const { getIcon } = wwLib.useIcons();
            chevronRightIcon.value = await getIcon('chevron-right');
            chevronDownIcon.value = await getIcon('chevron-down');
          }
        } catch (error) {
          console.warn('Could not load icons, using fallback symbols');
        }
      };
  
      loadIcons();
  
      // Computed properties
      const hasChildren = computed(() =>
        Array.isArray(props.node?.children) && props.node.children.length > 0
      );
  
      const isExpanded = computed(() =>
        props.expandedNodes?.has(props.node?.code)
      );
  
      const selectionState = computed(() =>
        getNodeSelectionState(props.node, props.selectedCodes)
      );
  
      const isSelected = computed(() =>
        selectionState.value === 'checked'
      );
  
      const isIndeterminate = computed(() =>
        selectionState.value === 'indeterminate'
      );
  
      const isSelectable = computed(() => true);
  
      const isHighlighted = computed(() => {
        if (!props.searchTerm) return false;
        const normalizedSearchTerm = normalizeString(props.searchTerm);
        return nodeMatchesSearch(props.node, normalizedSearchTerm);
      });
  
      const getNodeContentStyle = computed(() => ({
        paddingLeft: `${props.depth * 16}px`,
        display: 'flex',
        alignItems: 'center',
        minHeight: '36px',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background-color 0.15s ease',
      }));
  
      // Watch for expansion to lazy load children with immediate trigger
      watch(isExpanded, (expanded) => {
        if (expanded && !shouldRenderChildren.value) {
          // Use nextTick for smooth rendering
          nextTick(() => {
            shouldRenderChildren.value = true;
          });
        }
      }, { immediate: true });
  
      // Watch for search paths to lazy load children when needed
      watch(() => props.searchPaths, (paths) => {
        if (paths?.has(props.node?.code) && !shouldRenderChildren.value) {
          nextTick(() => {
            shouldRenderChildren.value = true;
          });
        }
      }, { deep: true });
  
      // Methods
      const toggleExpand = () => {
        if (!hasChildren.value) return;
        emit('toggle-expand', props.node.code);
      };
  
      const toggleSelect = () => {
        if (props.isEditing) return;
        emit('toggle-select', props.node);
      };
  
      const handleNodeClick = (event) => {
        if (event.target === event.currentTarget) {
          if (hasChildren.value) {
            toggleExpand();
          } else {
            toggleSelect();
          }
        }
      };
  
      const handleKeyDown = (event) => {
        switch (event.key) {
          case 'Enter':
          case ' ':
            event.preventDefault();
            toggleSelect();
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (hasChildren.value && !isExpanded.value) {
              toggleExpand();
            }
            break;
          case 'ArrowLeft':
            event.preventDefault();
            if (hasChildren.value && isExpanded.value) {
              toggleExpand();
            }
            break;
          default:
            break;
        }
      };
  
      return {
        hasChildren,
        isExpanded,
        isSelected,
        isIndeterminate,
        isSelectable,
        isHighlighted,
        shouldRenderChildren,
        chevronRightIcon,
        chevronDownIcon,
        toggleExpand,
        toggleSelect,
        handleNodeClick,
        handleKeyDown,
        getNodeContentStyle
      };
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .tree-node {
    position: relative;
    outline: none;
    contain: layout style; /* CSS containment for better performance */
  
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
      transition: background-color 0.15s ease; /* Faster transition */
  
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
      transition: background-color 0.15s ease; /* Faster transition */
  
      &:focus-visible {
        outline: 2px solid #4f46e5;
        border-radius: 4px;
      }
  
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
      }
  
      &-text {
        font-family: monospace;
        font-size: 12px;
        line-height: 1;
      }
    }
  
    &__spacer {
      width: 24px;
      margin-right: 4px;
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
      /* Removed complex animations for better performance */
  
      &::before {
        content: '';
        position: absolute;
        left: 12px;
        top: 0;
        bottom: 0;
        width: 1px;
        background-color: #e5e7eb;
      }
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
  </style>