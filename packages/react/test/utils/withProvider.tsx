import { ThemeInput } from '@fluentui/styles'
import * as React from 'react'
import { mount, ReactWrapper, MountRendererProps, ComponentType } from 'enzyme'
import { ThemeProvider } from 'react-fela'
import { felaRenderer } from 'src/utils'

export const EmptyThemeProvider: React.FunctionComponent = ({ children }) => (
  <ThemeProvider theme={{ renderer: felaRenderer, target: document }}>{children}</ThemeProvider>
)

interface AugmentedMountRendererProps extends MountRendererProps {
  wrappingComponent: React.FunctionComponent
}

export const mountWithProvider = <C extends React.Component, P = C['props'], S = C['state']>(
  node: React.ReactElement<P>,
  options?: AugmentedMountRendererProps,
  theme?: ThemeInput,
): ReactWrapper<P, S, C> => {
  return mount(node, {
    wrappingComponent: EmptyThemeProvider,
    ...options,
  })
}

export const mountWithProviderAndGetComponent = <
  C extends React.Component,
  P = C['props'],
  S = C['state']
>(
  Component: ComponentType<P>,
  elementToMount: React.ReactElement<P>,
  options?: AugmentedMountRendererProps,
  theme?: ThemeInput,
): ReactWrapper<P, any> => {
  return mountWithProvider(elementToMount, options, theme).find(Component)
}
