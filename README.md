# Dynamic i18n

For a statistics/analytics dasboard we needed a bit more advanced and customizable localization tool. Couldn't find what we needed actually so I build it

Basically this is a string interpolation tool which fill the placeholders with data on the fly based on certain condition and values.

## **Localization example** (vue)

```json
// en.json

{
  "the_label": "{name} has {count} {messages}"
}
```

```html
<div>
  <label>{{ getLabel }}</label>
</div>
```

```js
import en from 'en.json'
import io18n from 'dynamic-i18n-io'

get getLabel() {
  const someData = {
    name: 'Joe',
    count: 42,
  }

  return io18n(someData, en, {
    the_label: {
      options: {
        count: ['no', '{count}'],
        messages: ['messages', ''],
      },
      conditions: {
        count: (props) => props.count === 0
      }
    }
  })
}
```

Output

```html
<div>
  <label>Joe has 42 messages</label>
</div>
```

## **Greeting example**

```js
// fetched or static data
const data = {
  greeting: {
    isMale: true,
    name: 'Joe',
    age: 42,
  },
}

// en.js
const format = {
  greeting: {
    template: `Hello {isMale} {name} {age}`,
    options: {
      isMale: ['Sir', 'Madam'],
      name: ['{name}'], // replace by data in any case
      age: ['({age})'], // replace by data in any case
    },
    conditions: {
      isMale: (props) => props.isMale,
      name: true,
      age: (props) => props.isMale || props.age < 20,
    },
  },
}

const localizedData = i18n(data, format)

// data = { isMale: true, name: 'Joe', age: 42 }
// > 'Hello Sir Joe (42)'

// data = { isMale: false, name: 'Joelle', age: 42 }
// > 'Hello Madam Joelle'

// data = { isMale: false, name: 'Joelle', age: 18 }
// > 'Hello Madam Joelle (18)'
```

See [test](./__tests__/examples.spec.ts) for more examples
