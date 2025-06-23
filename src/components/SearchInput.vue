<template>
    <div class="search-input">
      <div class="search-input__icon" v-html="searchIcon"></div>
      <input
        type="text"
        class="search-input__field"
        :placeholder="placeholder"
        :value="modelValue"
        @input="onInput"
        aria-label="Search CPV codes"
      />
      <button
        v-if="modelValue"
        class="search-input__clear"
        @click="onClear"
        aria-label="Clear search"
        v-html="clearIcon"
      ></button>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { debounce } from 'lodash';
  
  export default {
    name: 'SearchInput',
    props: {
      modelValue: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: 'Search...'
      },
      debounceTime: {
        type: Number,
        default: 250
      }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const searchIcon = ref('');
      const clearIcon = ref('');
      
      // Load icons
      const { getIcon } = wwLib.useIcons();
      
      const loadIcons = async () => {
        searchIcon.value = await getIcon('search');
        clearIcon.value = await getIcon('x');
      };
      
      onMounted(() => {
        loadIcons();
      });
      
      // Debounced input handler
      const debouncedEmit = debounce((value) => {
        emit('update:modelValue', value);
      }, props.debounceTime);
      
      const onInput = (event) => {
        debouncedEmit(event.target.value);
      };
      
      const onClear = () => {
        emit('update:modelValue', '');
      };
      
      return {
        searchIcon,
        clearIcon,
        onInput,
        onClear
      };
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .search-input {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    
    &__icon {
      position: absolute;
      left: 10px;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }
    
    &__field {
      width: 100%;
      padding: 8px 36px 8px 36px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      
      &:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.2);
      }
      
      &::placeholder {
        color: #9ca3af;
      }
    }
    
    &__clear {
      position: absolute;
      right: 10px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: #6b7280;
      
      &:hover {
        color: #1f2937;
      }
    }
  }
  </style>