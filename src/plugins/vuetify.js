import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export function createDynamicVuetify(defaultTheme) {
  return createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: defaultTheme,
      themes: {
        light: {
          dark: false,
          colors: {
            background: '#faf8ef',
            surface: '#bbada0',
            primary: '#8f7a66',
            secondary: '#776e65',
          }
        },
        dark: {
          dark: true,
          colors: {
            background: '#271d14ff',
            surface: '#4d4136ff',
            primary: '#776e65',
            secondary: '#01a898ff',
          }
        }
      }
    }
  })
}
