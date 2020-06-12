# Dynamic i18n

For a statistics/analytics dasboard we needed a bit more advanced and customizable localization tool. Couldn't find what we needed actually so I build it

Basically this is a string interpolation tool which fill the placeholders with data on the fly based on certain condition and values.

## **Notification example**

```js

// fetched or static data
const data = {
  message_count: 2,
};

// en.js
export default {
  message_count: {
    // the placeholders {n} are linked to the options
    // so {0} links to options[0] ...
    template: `You have {0} unread {1}`,

    // the array items in the options are linked
    // to the array items in the conditions array
    options: [ 
      ['{0}', 'no'],
      ['messages', 'message']
    ],
    
    // the conditions determine the options to show
    // so if condition[0] is true
    // the options[0][0] will be shown else options[0][1]
    
    // a condition could also be just true, then you can
    // have just one array item for the relative options[index]
    // e.g.: options[0] should always display the number of
    // message_counts then instead of having a callback
    // conditions[0] = true will be enough
    conditions: [
        (message_count) => message_count > 1 || message_count === 1,
        (message_count) => message_count > 1 || message_count === 0,
    ]
  }
};

const localizedData = i18n(data, format);

// data = { message_count: 0 }
// > 'You have no messages'

// data = { message_count: 1 }
// > 'You have 1 message'

// data = { message_count: 2 } or up
// > 'You have 2 messages'

```


## **Greeting example**

```js

// fetched or static data
const data = {
  greeting: {
    isMale: true,
    name:   'Joe',
    age:    42
  },
};

// en.js
const format = {
  greeting: {
    template: `Hello {isMale} {name} {age}`,
    options: {
      isMale: ['Sir', 'Madam'],
      name:   ['{name}', ''],
      age:    ['({age})', '']
    },
    conditions: {
      isMale: (props) => props.isMale,
      name:   true,
      age:    (props) => props.isMale || props.age < 20,
    }
  }
};

const localizedData = i18n(data, format);

// data = { isMale: true, name: 'Joe', age: 42 }
// > 'Hello Sir Joe (42)'

// data = { isMale: false, name: 'Joelle', age: 42 }
// > 'Hello Madam Joelle'

// data = { isMale: false, name: 'Joelle', age: 18 }
// > 'Hello Madam Joelle (18)'

```