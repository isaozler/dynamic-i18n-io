import { describe, expect, test } from '@jest/globals'
import parseI18n from '../src'
import locale from '../src/en.json'

describe('test module', () => {
  it('Readme - Vue example 1 - 42 messages', () => {
    const result = parseI18n({
      name: 'Joe',
      count: 42,
    }, {
      the_label: "{name} has {count} {messages}"
    }, {
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

    expect(result).toStrictEqual({
      the_label: 'Joe has 42 messages',
    })
  })

  it('Readme - Vue example 2 - no message', () => {
    const result = parseI18n({
      name: 'Joe',
      count: 0,
    }, {
      the_label: "{name} has {count} {messages}",
      the_label2: "{a} has {b} {c}"
    }, {
      the_label: {
        options: {
          count: [`no`, '{count}'],
          messages: ['messages', ''],
        },
        conditions: {
          count: (props) => props.count === 0
        }
      }
    })

    expect(result).toStrictEqual({
      the_label: 'Joe has no messages',
      the_label2: '{a} has {b} {c}',
    })
  })

  it('Readme - Vue example 3 - no message with html markup', () => {
    const result = parseI18n({
      name: 'Joe',
      count: 0,
    }, {
      the_label: "{name} has {count} {messages}",
      the_label2: "{a} has {b} {c}"
    }, {
      the_label: {
        options: {
          count: [`<span color="red">no</span>`, '{count}'],
          messages: ['messages', ''],
        },
        conditions: {
          count: (props) => props.count === 0
        }
      }
    })

    expect(result).toStrictEqual({
      the_label: 'Joe has <span color="red">no</span> messages',
      the_label2: '{a} has {b} {c}',
    })
  })

  it('Readme - Vue example 4 - 42 messages without messages label so "messages" is displayed as {placeholder}', () => {
    const result = parseI18n({
      name: 'Joe',
      count: 42,
    }, {
      the_label: "{name} has {count} {messages}"
    }, {
      the_label: {
        options: {
          count: ['no', '{count}'],
        },
        conditions: {
          count: (props) => props.count === 0
        }
      }
    })

    expect(result).toStrictEqual({
      the_label: 'Joe has 42 {messages}',
    })
  })

  it('Readme - Greeting example 1 - condition: male + age > 20', () => {
    const result = parseI18n({
      greeting: {
        isMale: true,
        name: 'Joe',
        age: 42
      },
    }, {
      greeting: {
        template: `Hello {isMale} {name} {age}`,
        options: {
          isMale: ['Sir', 'Madam'],
          name: ['{name}', ''],
          age: ['({age})', '']
        },
        conditions: {
          isMale: (props) => props.isMale,
          name: true,
          age: (props) => props.isMale || props.age < 20,
        }
      }
    })

    expect(result).toStrictEqual({
      greeting: 'Hello Sir Joe (42)',
    })
  })

  it('Readme - Greeting example 2 - condition madam + age > 20', () => {
    const result = parseI18n({
      greeting: {
        isMale: false,
        name: 'Joelle',
        age: 42,
      },
    }, {
      greeting: {
        template: `Hello {isMale} {name}{age}`,
        options: {
          isMale: ['Sir', 'Madam'],
          name: ['{name}', ''],
          age: [' ({age})', '']
        },
        conditions: {
          isMale: (props) => props.isMale,
          name: true,
          age: (props) => props.isMale || props.age < 20,
        }
      }
    })

    expect(result).toStrictEqual({
      greeting: 'Hello Madam Joelle',
    })
  })

  it('Readme - Greeting example 3 - condition: madam + age < 20', () => {
    const result = parseI18n({
      greeting: {
        isMale: false,
        name: 'Joelle',
        age: 18,
      },
    }, {
      greeting: {
        template: `Hello {isMale} {name}{age}`,
        options: {
          isMale: ['Sir', 'Madam'],
          name: ['{name}', ''],
          age: [' ({age})', '']
        },
        conditions: {
          isMale: (props) => props.isMale,
          name: true,
          age: (props) => props.isMale || props.age < 20,
        }
      }
    })

    expect(result).toStrictEqual({
      greeting: 'Hello Madam Joelle (18)',
    })
  })

  it('locale file', () => {
    const mockData = {
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
      }
    }
    const result = parseI18n(mockData, locale as any)

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have {count} {messages}',
    })
  })

  it('locale file in string', () => {
    const mockData = {
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
      }
    }
    const result = parseI18n(mockData, JSON.stringify(locale) as any)

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have {count} {messages}',
    })
  })

  it('locale file with options and conditions override', () => {
    const mockData = {
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
      },
      messages_notifications: {
        count: 2,
      }
    }
    const result = parseI18n(mockData, locale as any, {
      locale_greeting: {
        options: {
          age: ['{age}', '30+'],
        },
        conditions: {
          age: (props) => props.age < 30,
        }
      },
      messages_notifications: {
        options: {
          messages: ['message', 'messages'],
        },
        conditions: {
          messages: (props) => props.count === 1,
        },
      }
    } as any)

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (30+)',
      messages_notifications: 'You have 2 messages',
    })
  })

  it('locale file with options and conditions override and default fallback', () => {
    const mockData = {
      locale_greeting: {
        name: 'Fatosh',
        age: 27,
      },
      messages_notifications: {
        count: 2,
      }
    }
    const result = parseI18n(mockData, locale as any, {
      messages_notifications: {
        options: {
          messages: ['messages', 'message'],
        },
        conditions: {
          messages: (props) => props.count > 1,
        },
      }
    } as any)

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (27)',
      messages_notifications: 'You have 2 messages',
    })
  })
})
