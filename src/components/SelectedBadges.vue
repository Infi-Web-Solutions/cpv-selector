<template>
    <div class="selected-badges">
      <div v-if="selectedNodes.length === 0" class="selected-badges__placeholder">
        No items selected
      </div>
      <template v-else>
        <div
          v-for="node in visibleNodes"
          :key="node.code"
          class="selected-badges__badge"
        >
          <span class="selected-badges__badge-text">
            {{ node.code }}: {{ truncateText(node.description, 20) }}
          </span>
          <button
            class="selected-badges__badge-remove"
            @click="() => onRemove(node)"
            aria-label="Remove item"
            v-html="closeIcon"
          ></button>
        </div>
        
        <div v-if="hasMoreNodes" class="selected-badges__more">
          +{{ selectedNodes.length - maxVisible }} more
        </div>
      </template>
    </div>
  </template>
  
  <script>
  import { computed, ref, onMounted } from 'vue';
  
  export default {
    name: 'SelectedBadges',
    props: {
      selectedNodes: {
        type: Array,
        default: () => []
      },
      maxVisible: {
        type: Number,
        default: 3
      }
    },
    emits: ['remove'],
    setup(props, { emit }) {
      const closeIcon = ref('');
      
      // Load icons
      const { getIcon } = wwLib.useIcons();
      
      const loadIcons = async () => {
        closeIcon.value = await getIcon('x');
      };
      
      onMounted(() => {
        loadIcons();
      });
      
      const visibleNodes = computed(() => 
        props.selectedNodes.slice(0, props.maxVisible)
      );
      
      const hasMoreNodes = computed(() => 
        props.selectedNodes.length > props.maxVisible
      );
      
      const onRemove = (node) => {
        emit('remove', node);
      };
      
      const truncateText = (text, maxLength) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
      };
      
      return {
        visibleNodes,
        hasMoreNodes,
        onRemove,
        truncateText,
        closeIcon
      };
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .selected-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    &__placeholder {
      color: #6b7280;
      font-size: 14px;
    }
    
    &__badge {
      display: flex;
      align-items: center;
      background-color: #f3f4f6;
      border-radius: 9999px;
      padding: 4px 8px 4px 12px;
      font-size: 12px;
      max-width: 200px;
      
      &-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      &-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        margin-left: 4px;
        padding: 2px;
        color: #6b7280;
        border-radius: 9999px;
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
          color: #1f2937;
        }
      }
    }
    
    &__more {
      display: flex;
      align-items: center;
      background-color: #e5e7eb;
      border-radius: 9999px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
    }
  }
  </style>