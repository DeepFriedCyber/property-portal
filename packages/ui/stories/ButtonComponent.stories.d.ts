import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").FC<import("../components/Button").ButtonProps>;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {
        variant: {
            control: {
                type: "select";
            };
            options: string[];
        };
        disabled: {
            control: {
                type: "boolean";
            };
        };
        onClick: {
            action: string;
        };
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Primary: Story;
export declare const Secondary: Story;
export declare const Disabled: Story;
export declare const WithCustomClassName: Story;
//# sourceMappingURL=ButtonComponent.stories.d.ts.map