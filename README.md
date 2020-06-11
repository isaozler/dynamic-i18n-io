# WIP: dynamic-i18n-io

```js

import i18n from 'dynamic-i18n-io';

const data = {
  message_count: 2,
  greeting: {
    isMale: false,
    name: 'IO',
  },
};

const format = {
  message_count: {
    template: `You have {0} unread {1}`,
    options: [ 
      ['{0}'],
      ['messages', 'message']
    ],
    conditions: [ true, (message_count) => message_count > 1 ]
  },
  greeting: {
    template: `Hello {isMale} {name}`,
    options: {
      isMale: ['sir', 'madam'],
      name: '{name}',
    },
    conditions: {
      isMale: (props) => props.isMale,
      name: true,
    }
  }
};

const localizedData = i18n(data, format);

```
