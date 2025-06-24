export default {
  editor: {
    label: { en: 'CPV Tree Selector' },
    icon: 'collection'
  },

  properties: {
    // ─── OUTPUT ──────────────────────────────────────────────────────────────
    selectedCpvCodes: {
      label: { en: 'Selected CPV Codes' },
      type: 'variable',          // ← lowercase, makes this an "Outputs" slot
      section: 'outputs',        // ← groups it under Outputs in the panel
      bindable: true,
      defaultValue: '',          // ← empty string default for a bound var
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Bind to a page-variable of type Array to receive the selected CPV codes'
      },
      propertyHelp: {
        tooltip: 'The page variable that will be updated with your selection'
      }
      /* wwEditor:end */
    },

    // ─── INPUTS ───────────────────────────────────────────────────────────────
    cpvStructure: {
      label: { en: 'CPV Structure Data' },
      type: 'object',
      section: 'settings',
      bindable: true,
      defaultValue: {},
      /* wwEditor:start */
      bindingValidation: {
        type: 'object',
        tooltip: 'Bind to your cpv_structure variable containing hierarchical CPV data'
      },
      propertyHelp: {
        tooltip: 'The cpv_structure variable containing your complete CPV hierarchy'
      }
      /* wwEditor:end */
    },
    cpvCollection: {
      label: { en: 'CPV Collection' },
      type: 'array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Bind to a collection containing CPV hierarchy data'
      },
      propertyHelp: {
        tooltip: 'Connect to a collection containing the CPV hierarchy structure'
      }
      /* wwEditor:end */
    },
    codeField: {
      label: { en: 'Code Field' },
      type: 'text',
      section: 'settings',
      bindable: true,
      defaultValue: 'code',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Field name in your collection that contains the CPV code'
      },
      propertyHelp: {
        tooltip: 'Specify which field in your collection contains the CPV code'
      }
      /* wwEditor:end */
    },
    descriptionField: {
      label: { en: 'Description Field' },
      type: 'text',
      section: 'settings',
      bindable: true,
      defaultValue: 'description',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Field name in your collection that contains the CPV description'
      },
      propertyHelp: {
        tooltip: 'Specify which field in your collection contains the CPV description'
      }
      /* wwEditor:end */
    },
    level1Field: {
      label: { en: 'Level 1 Field (Division)' },
      type: 'text',
      section: 'settings',
      bindable: true,
      defaultValue: 'division_code',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Field name for Level 1 (Division) code'
      },
      propertyHelp: {
        tooltip: 'Specify which field in your collection contains the Level 1 (Division) code'
      }
      /* wwEditor:end */
    },
    level2Field: {
      label: { en: 'Level 2 Field (Group)' },
      type: 'text',
      section: 'settings',
      bindable: true,
      defaultValue: 'group_code',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Field name for Level 2 (Group) code'
      },
      propertyHelp: {
        tooltip: 'Specify which field in your collection contains the Level 2 (Group) code'
      }
      /* wwEditor:end */
    },
    level3Field: {
      label: { en: 'Level 3 Field (Class)' },
      type: 'text',
      section: 'settings',
      bindable: true,
      defaultValue: 'class_code',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Field name for Level 3 (Class) code'
      },
      propertyHelp: {
        tooltip: 'Specify which field in your collection contains the Level 3 (Class) code'
      }
      /* wwEditor:end */
    },
    level4Field: {
      label: { en: 'Level 4 Field (Category)' },
      type: 'text',
      section: 'settings',
      bindable: true,
      defaultValue: 'category_code',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Field name for Level 4 (Category) code'
      },
      propertyHelp: {
        tooltip: 'Specify which field in your collection contains the Level 4 (Category) code'
      }
      /* wwEditor:end */
    },
    level5Field: {
      label: { en: 'Level 5 Field (Sub-category)' },
      type: 'text',
      section: 'settings',
      bindable: true,
      defaultValue: 'subcategory_code',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Field name for Level 5 (Sub-category) code'
      },
      propertyHelp: {
        tooltip: 'Specify which field in your collection contains the Level 5 (Sub-category) code'
      }
      /* wwEditor:end */
    },
    triggerLabel: {
      label: { en: 'Trigger Label' },
      type: 'text',
      section: 'settings',
      bindable: true,
      defaultValue: 'CPV Codes',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'String displayed on the dropdown trigger button'
      },
      propertyHelp: {
        tooltip: 'The text shown on the dropdown button'
      }
      /* wwEditor:end */
    },
    searchPlaceholder: {
      label: { en: 'Search Placeholder' },
      type: 'text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Search CPV codes…',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Placeholder text for the search input'
      },
      propertyHelp: {
        tooltip: 'The placeholder shown in the search box'
      }
      /* wwEditor:end */
    },
    showSelectedInDropdown: {
      label: { en: 'Show Selected in Dropdown' },
      type: 'onOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Whether to show selected badges in the dropdown'
      },
      propertyHelp: {
        tooltip: 'Display selected items as badges inside the dropdown'
      }
      /* wwEditor:end */
    },
    defaultSelectedCodes: {
      label: { en: 'Default Selected Codes' },
      type: 'array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel: (_, i) => `Code ${i+1}`,
        item: { type: 'text', options: { placeholder: 'Enter CPV code' } }
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of CPV codes to pre-select'
      },
      propertyHelp: {
        tooltip: 'Pre-select these CPV codes on load'
      }
      /* wwEditor:end */
    },
    initialValue: {
      label: { en: 'Initial Value' },
      type: 'array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel: (_, i) => `Item ${i+1}`,
        item: {
          type: 'object',
          defaultValue: { code: '', description: '' },
          options: {
            item: {
              code:        { label: 'Code',        type: 'text', options: { placeholder: 'Enter CPV code'        } },
              description: { label: 'Description', type: 'text', options: { placeholder: 'Enter description' } }
            }
          }
        }
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of objects with code & description'
      },
      propertyHelp: {
        tooltip: 'Initial selection of CPV codes'
      }
      /* wwEditor:end */
    },

    // ─── STYLE ────────────────────────────────────────────────────────────────
    maxDropdownHeight: {
      label: { en: 'Max Dropdown Height' },
      type: 'length',
      section: 'style',
      bindable: true,
      // defaultValue: '400px',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'CSS length for the maximum height of dropdown'
      },
      propertyHelp: {
        tooltip: 'Max height of the dropdown panel'
      }
      /* wwEditor:end */
    },
    triggerBackgroundColor: {
      label: { en: 'Trigger Background' },
      type: 'color',
      section: 'style',
      bindable: true,
      defaultValue: '#FFFFFF',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'CSS color for the trigger button background'
      },
      propertyHelp: {
        tooltip: 'Background color of the dropdown trigger'
      }
      /* wwEditor:end */
    },
    triggerTextColor: {
      label: { en: 'Trigger Text Color' },
      type: 'color',
      section: 'style',
      bindable: true,
      defaultValue: '#000000',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'CSS color for the trigger button text'
      },
      propertyHelp: {
        tooltip: 'Text color of the dropdown trigger'
      }
      /* wwEditor:end */
    },
    triggerHeight: {
      label: { en: 'Trigger Button Height' },
      type: 'length',
      section: 'style',
      bindable: true,
      defaultValue: 'auto',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'CSS length for the trigger button height (e.g., "44px", "60px", "auto")'
      },
      propertyHelp: {
        tooltip: 'Height of the dropdown trigger button. Use "auto" for dynamic height based on content.'
      }
      /* wwEditor:end */
    },
    accentColor: {
      label: { en: 'Accent Color' },
      type: 'color',
      section: 'style',
      bindable: true,
      defaultValue: '#4F46E5',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'CSS color for accent elements'
      },
      propertyHelp: {
        tooltip: 'Color used for highlights and selected items'
      }
      /* wwEditor:end */
    },
    showSelectedSection: {
      label: { en: 'Show Selected Section' },
      type: 'onOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show the selected items section below dropdown'
      },
      propertyHelp: {
        tooltip: 'Display selected CPV codes in a dedicated section'
      }
      /* wwEditor:end */
    }
  },

  triggerEvents: [
    {
      name: 'change',
      label: { en: 'On change' },
      event: { value: [] },
      default: true
    }
  ],

  actions: [
    { action: 'clearSelection', label: { en: 'Clear selection' } },
    { action: 'openDropdown',     label: { en: 'Open dropdown'   } },
    { action: 'closeDropdown',    label: { en: 'Close dropdown'  } }
  ]
};
