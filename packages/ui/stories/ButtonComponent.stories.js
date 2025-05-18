import { Button } from '../components/Button'
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    onClick: { action: 'clicked' },
  },
}
export default meta
export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}
export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}
export const Disabled = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
}
export const WithCustomClassName = {
  args: {
    className: 'w-full max-w-xs',
    children: 'Custom Width Button',
  },
}
//# sourceMappingURL=ButtonComponent.stories.js.map
