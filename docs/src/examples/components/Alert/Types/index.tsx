import * as React from 'react'

import ComponentExample from 'docs/src/components/ComponentDoc/ComponentExample'
import ExampleSection from 'docs/src/components/ComponentDoc/ExampleSection'

const Types = () => (
  <ExampleSection title="Types">
    <ComponentExample
      title="Default"
      description="A default Alert."
      examplePath="components/Alert/Types/AlertExample"
    />
    <ComponentExample
      title="Dismissible"
      description="A message that the user can choose to hide."
      examplePath="components/Alert/Types/AlertExampleDismissible"
    />
  </ExampleSection>
)

export default Types
