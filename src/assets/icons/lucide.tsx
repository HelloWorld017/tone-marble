import { BubblesIcon, Gamepad2Icon, SmartphoneIcon, XIcon } from 'lucide-react';
import type { ComponentProps, ComponentType } from 'react';

const wrapLucideComponent =
  <T extends ComponentType>(LucideIcon: T) =>
  (props: ComponentProps<T>) => {
    const Icon = LucideIcon as ComponentType<{ width: string; height: string }>;
    return <Icon width="1em" height="1em" {...props} />;
  };

export const IconBubbles = wrapLucideComponent(BubblesIcon);
export const IconGamepad = wrapLucideComponent(Gamepad2Icon);
export const IconSmartphone = wrapLucideComponent(SmartphoneIcon);
export const IconX = wrapLucideComponent(XIcon);
