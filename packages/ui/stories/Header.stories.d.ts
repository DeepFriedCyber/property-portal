import type { StoryObj } from '@storybook/react';
import { HeaderProps } from './Header';
declare const meta: {
    title: string;
    component: ({ user, onLogin, onLogout, onCreateAccount }: HeaderProps) => import("react/jsx-runtime").JSX.Element;
    tags: string[];
    parameters: {
        layout: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const LoggedIn: Story;
export declare const LoggedOut: Story;
//# sourceMappingURL=Header.stories.d.ts.map