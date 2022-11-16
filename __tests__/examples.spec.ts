import { describe, expect, it } from '@jest/globals'
import parseI18n from '../src'
import locale from '../src/en.json'
import localeNested from '../src/en-nested.json'
import localeNestedMultiTyped from '../src/en-nested-multitype.json'

describe('test module', () => {
  it('Readme - Vue example 1 - 42 messages', () => {
    const result = parseI18n(
      {
        name: 'Joe',
        count: 42,
      },
      {
        format: {
          the_label: "{name} has {count} {messages}"
        },
        override: {
          the_label: {
            options: {
              count: ['no', '{count}'],
              messages: ['messages', ''],
            },
            conditions: {
              count: (props) => props.count === 0
            }
          }
        }
      }
    )

    expect(result).toStrictEqual({
      the_label: 'Joe has 42 messages',
    })
  })

  it('Readme - Vue example 2 - no message', () => {
    const result = parseI18n({
      name: 'Joe',
      count: 0,
    }, {
      format: {
        the_label: "{name} has {count} {messages}",
        the_label2: "{a} has {b} {c}"
      },
      override: {
        the_label: {
          options: {
            count: [`no`, '{count}'],
            messages: ['messages', ''],
          },
          conditions: {
            count: (props) => props.count === 0
          }
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
      format: {
        the_label: "{name} has {count} {messages}",
        the_label2: "{a} has {b} {c}"
      },
      override: {
        the_label: {
          options: {
            count: [`<span color="red">no</span>`, '{count}'],
            messages: ['messages', ''],
          },
          conditions: {
            count: (props) => props.count === 0
          }
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
      format: {
        the_label: "{name} has {count} {messages}"
      },
      override: {
        the_label: {
          options: {
            count: ['no', '{count}'],
          },
          conditions: {
            count: (props) => props.count === 0
          }
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
      format: {
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
      format: {
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
      format: {
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
    const result = parseI18n(mockData, {
      format: locale,
    })

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have {count} {messages}',
    })
  })

  it('locale file in string', () => {
    const result = parseI18n({
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
      }
    }, {
      format: JSON.stringify(locale) as any
    })

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have {count} {messages}',
    })
  })

  it('locale file with options and conditions override', () => {
    const result = parseI18n({
      locale_greeting: {
        name: 'Fatosh',
        age: 27,
      },
      messages_notifications: {
        count: 2,
      }
    }, {
      format: locale,
      override: {
        locale_greeting: {
          options: {
            age: ['{age}', '31 plus'],
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
      }
    })

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (27)',
      messages_notifications: 'You have 2 messages',
    })
  })

  it('locale file with options and conditions override and default fallback', () => {
    const result = parseI18n({
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
      },
      messages_notifications: {
        count: 2,
      }
    }, {
      format: locale,
      override: {
        messages_notifications: {
          options: {
            messages: ['messages', 'message'],
          },
          conditions: {
            messages: (props) => props.count > 1,
          },
        }
      }
    })

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have 2 messages',
    })
  })

  it('locale file with options and conditions override and index returns', () => {
    const result = parseI18n(
      {
        count: 22,
      },
      {
        format: locale,
        override: {
          messages_notifications: {
            options: {
              count: ["no", "one", "{count}"],
              messages: ["messages", "message", "+ messages"],
            },
            conditions: {
              count: (props) => {
                if (props.count === 0) {
                  return 0
                } else if (props.count === 1) {
                  return 1
                }

                return 2
              },
              messages: (props) => {
                if (props.count === 0) {
                  return 0
                } else if (props.count === 1) {
                  return 1
                }

                return 2
              },
            },
          },
        }
      }
    )
    expect(result).toStrictEqual({
      locale_greeting: 'Hi {name} ({age})',
      messages_notifications: 'You have 22 + messages',
    })
  })

  it('locale file nested with specific data points', () => {
    const result = parseI18n({
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
      },
      error: {
        unsaved_n: 10,
        entity: 'DSA',
        errorMessage: 'Some Error',
        modal: {
          close: {
            unsaved_n: 22,
          }
        }
      }
    }, {
      format: localeNested as any,
    })

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have {count} {messages}',
      error: {
        load: 'Failed to load DSA due to \"Some Error\"',
        modal: {
          close: 'Closing blocked due to 22 unsaved input',
        },
        save: 'Failed to save DSA due to \"Some Error\"',
      }
    })
  })

  it('locale file nested with no specific data points with fallback', () => {
    const result = parseI18n({
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
        unsaved_n: 10,
      },
      error: {
        entity: 'DSA',
        errorMessage: 'Some Error',
        modal: {
          close: {
            // unsaved_n: null,
          }
        }
      }
    }, {
      format: localeNested as any,
    })

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have {count} {messages}',
      error: {
        load: 'Failed to load DSA due to \"Some Error\"',
        modal: {
          close: 'Closing blocked due to 10 unsaved input',
        },
        save: 'Failed to save DSA due to \"Some Error\"',
      }
    })
  })

  it('locale file nested with no specific data points without fallback', () => {
    const result = parseI18n({
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
        unsaved_n: 10,
      },
      error: {
        entity: 'DSA',
        errorMessage: 'Some Error',
        modal: {
          close: {
            unsaved_n: null,
          }
        }
      }
    }, {
      format: localeNested as any,
    })

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have {count} {messages}',
      error: {
        load: 'Failed to load DSA due to \"Some Error\"',
        modal: {
          close: 'Closing blocked due to {unsaved_n} unsaved input',
        },
        save: 'Failed to save DSA due to \"Some Error\"',
      }
    })
  })

  it('locale file nested with multitypes (arrays) with specific data', () => {
    const result = parseI18n({
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
        unsaved_n: 10,
      },
      error: {
        entity: 'DSA',
        errorMessage: 'Some Error',
        modal: {
          close: {
            unsaved_n: null,
          }
        },
        popUps: {
          name: '1',
          age: 1,
          count: 1
        }
      },
    }, {
      format: localeNestedMultiTyped as any,
    })

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have 1 {messages}',
      error: {
        load: 'Failed to load DSA due to \"Some Error\"',
        modal: {
          close: 'Closing blocked due to {unsaved_n} unsaved input',
        },
        save: 'Failed to save DSA due to \"Some Error\"',
        popUps: [
          "Title popup name: 1",
          "Title popup age: 1",
          "Title popup count: 1",
        ]
      }
    })
  })

  it('locale file nested with multitypes (arrays) without specific data', () => {
    const result = parseI18n({
      locale_greeting: {
        name: 'Fatosh',
        age: 37,
        unsaved_n: 10,
      },
      error: {
        entity: 'DSA',
        errorMessage: 'Some Error',
        modal: {
          close: {
            unsaved_n: null,
          }
        },
        popUps: {
          name: '1',
          // age: 1,
          count: 1
        }
      },
      popUps: {
        name: '-1',
        age: -1,
        // count: -1
      }
    }, {
      format: localeNestedMultiTyped as any,
    })

    expect(result).toStrictEqual({
      locale_greeting: 'Hi Fatosh (37)',
      messages_notifications: 'You have 1 {messages}',
      error: {
        load: 'Failed to load DSA due to \"Some Error\"',
        modal: {
          close: 'Closing blocked due to {unsaved_n} unsaved input',
        },
        save: 'Failed to save DSA due to \"Some Error\"',
        popUps: [
          "Title popup name: 1",
          "Title popup age: -1",
          "Title popup count: 1",
        ]
      }
    })
  })
})

