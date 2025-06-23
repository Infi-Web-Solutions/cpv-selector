const component = require('./src/wwElement.vue');
const config = require('./ww-config.js');

module.exports = {
  editor: config.editor,
  properties: config.properties,
  triggerEvents: config.triggerEvents,
  actions: config.actions,
  component: component
};