// The App language, shared with every screen through a React context (a value
// any component can read without passing it down by hand). App owns the state
// and saves it to the store; screens call useStrings() for their text.

import { createContext, useContext } from 'react'
import { STRINGS } from './strings'
import type { Language, Strings } from './strings'

export interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const LanguageContext = createContext<LanguageState>({
  language: 'en',
  setLanguage: () => {},
})

export function useLanguage(): LanguageState {
  return useContext(LanguageContext)
}

// The text for the current language.
export function useStrings(): Strings {
  return STRINGS[useContext(LanguageContext).language]
}
