<template>
    <div class="virtualized-tree-list" ref="containerRef">
    <div
    class="virtualized-tree-list__inner"
    :style="{
    height: `${totalHeight}px`,
    position: 'relative'
    }"
    >
    <div
    v-for="({ index, node }, i) in visibleNodes"
    :key="`${node.code}-${i}`"
    :style="{
    position: 'absolute',
    top: `${index * itemHeight}px`,
    width: '100%'
    }"
    >
    <TreeNode
    :node="node"
    :depth="node.depth"
    :expanded-nodes="expandedNodes"
    :selected-codes="selectedCodes"
    :search-paths="searchPaths"
    :search-term="searchTerm"
    :is-editing="isEditing"
    @toggle-expand="$emit('toggle-expand', $event)"
    @toggle-select="$emit('toggle-select', $event)"
    />
    </div>
    </div>
    </div>
    </template>
    
    <script>
    import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
    import TreeNode from './TreeNode.vue';
    
    export default {
    name: 'VirtualizedTreeList',
    components: {
    TreeNode
    },
    props: {
    nodes: {
    type: Array,
    required: true
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
    setup(props) {
    const containerRef = ref(null);
    const scrollTop = ref(0);
    const viewportHeight = ref(0);
    const itemHeight = 36; // Approximate height of each tree node
    const overscan = 5; // Number of items to render above/below viewport
    
    // Flatten the tree for virtualization
    const flattenedNodes = computed(() => {
    const flattened = [];
    
    const flatten = (nodes, depth = 0) => {
    if (!Array.isArray(nodes)) return;
    
    nodes.forEach(node => {
    flattened.push({ ...node, depth });
    
    if (node.children && props.expandedNodes.has(node.code)) {
    flatten(node.children, depth + 1);
    }
    });
    };
    
    flatten(props.nodes);
    return flattened;
    });
    
    const totalHeight = computed(() => 
    flattenedNodes.value.length * itemHeight
    );
    
    const visibleNodes = computed(() => {
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan);
    const end = Math.min(
    flattenedNodes.value.length,
    Math.ceil((scrollTop.value + viewportHeight.value) / itemHeight) + overscan
    );
    
    return Array.from({ length: end - start }, (_, i) => ({
    index: start + i,
    node: flattenedNodes.value[start + i]
    }));
    });
    
    const handleScroll = () => {
    if (!containerRef.value) return;
    scrollTop.value = containerRef.value.scrollTop;
    };
    
    const updateViewportHeight = () => {
    if (!containerRef.value) return;
    viewportHeight.value = containerRef.value.clientHeight;
    };
    
    onMounted(() => {
    if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll);
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    }
    });
    
    onBeforeUnmount(() => {
    if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', updateViewportHeight);
    }
    });
    
    // Re-calculate when expanded nodes change
    watch(() => props.expandedNodes, () => {
    updateViewportHeight();
    });
    
    return {
    containerRef,
    visibleNodes,
    totalHeight,
    itemHeight
    };
    }
    };
    </script>
    
    <style lang="scss" scoped>
    .virtualized-tree-list {
    height: 100%;
    overflow-y: auto;
    
    &__inner {
    position: relative;
    width: 100%;
    }
    }
    </style>