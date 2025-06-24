---
name: cpv-tree-selector
description: An accessible, keyboard-friendly dropdown tree for selecting Common Procurement Vocabulary (CPV) codes with search and multi-selection capabilities.
keywords: cpv, tree, dropdown, select, search, multi-select, procurement, hierarchy
---

#### CPV Tree Selector

***Purpose:***
A specialized dropdown component for navigating and selecting items from the Common Procurement Vocabulary (CPV) hierarchical structure, with support for search, keyboard navigation, and multi-selection.

***Features:***
- Five-level hierarchical tree navigation (division → group → class → category → sub-category)
- Efficient lazy-rendering of deep branches for optimal performance
- Keyboard navigation with arrow keys, space/enter to toggle, home/end
- Search functionality with debounced input and match highlighting
- Multi-select with parent-child relationship logic (selecting parent toggles all children)
- Indeterminate checkbox state for partially selected branches
- Selected items displayed as removable badges with counter
- Dedicated selected items section below the dropdown
- Virtualized rendering for large node lists (>100 items)
- Collection binding with configurable field mapping for each hierarchy level

***Properties:***
- cpvCollection: Array - Collection containing CPV hierarchy data
- codeField: string - Field name in collection containing CPV code (default: "code")
- descriptionField: string - Field name in collection containing CPV description (default: "description")
- level1Field: string - Field name for Level 1/Division (default: "division_code")
- level2Field: string - Field name for Level 2/Group (default: "group_code")
- level3Field: string - Field name for Level 3/Class (default: "class_code")
- level4Field: string - Field name for Level 4/Category (default: "category_code")
- level5Field: string - Field name for Level 5/Sub-category (default: "subcategory_code")
- triggerLabel: string - The text displayed on the dropdown button (default: "CPV Codes")
- searchPlaceholder: string - Placeholder text for the search input (default: "Search CPV codes...")
- showSelectedInDropdown: boolean - Whether to show selected items inside the dropdown (default: true)
- showSelectedSection: boolean - Whether to show selected items section below dropdown (default: true)
- defaultSelectedCodes: string[] - Array of CPV codes to be selected by default
- initialValue: Array<{code: string, description: string}> - Initial selection of CPV codes, useful for binding from collections
- maxDropdownHeight: string - CSS length value for dropdown height (default: "400px")
- triggerBackgroundColor: string - Background color for the trigger button (default: "#FFFFFF")
- triggerTextColor: string - Text color for the trigger button (default: "#000000")
- triggerHeight: string - Height of the trigger button (default: "auto" for dynamic height)
- accentColor: string - Color used for highlights and interactive elements (default: "#4F46E5")

***Events:***
- change: Triggered when selection changes. Payload: { value: Array<{code: string, description: string}> }

***Exposed Actions:***
- `clearSelection`: Clears all selected items
- `openDropdown`: Opens the dropdown panel
- `closeDropdown`: Closes the dropdown panel

***Exposed Variables:***
- selectedItems: Array of selected CPV items with code and description (path: variables['current_element_uid-selectedItems'])

***Notes:***
- The component uses debounced search (250ms) to prevent performance issues during typing
- Search matches both code and description, ignoring accents and case
- Branches containing search matches are automatically expanded
- The tree supports virtualization for optimal performance with large datasets
- All interactions are disabled in editor mode for better editing experience
- The component can be bound to a collection using the cpvCollection property
- First level categories are expanded by default for better browsing experience
- When binding to a collection, you can specify which fields correspond to each level of the CPV hierarchy
- The collection should contain fields for each level of the hierarchy (division_code through subcategory_code)
- For each code field, there should be a corresponding description field (e.g., division_desc, group_desc, etc.)
- Selected items can be displayed both within the dropdown and in a dedicated section below it