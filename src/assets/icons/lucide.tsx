import {
  ArrowUpRightIcon,
  BubblesIcon,
  ChevronDownIcon,
  CogIcon,
  FileTextIcon,
  Gamepad2Icon,
  Link2OffIcon,
  PauseIcon,
  PercentIcon,
  PlayIcon,
  SmartphoneIcon,
  TriangleAlertIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from 'lucide-react';
import type { ComponentProps, ComponentType } from 'react';

const wrapLucideComponent =
  <T extends ComponentType>(LucideIcon: T) =>
  (props: ComponentProps<T>) => {
    const Icon = LucideIcon as ComponentType<{ width: string; height: string }>;
    return <Icon width="1em" height="1em" {...props} />;
  };

export const IconArrowUpRight = wrapLucideComponent(ArrowUpRightIcon);
export const IconBubbles = wrapLucideComponent(BubblesIcon);
export const IconChevronDown = wrapLucideComponent(ChevronDownIcon);
export const IconCog = wrapLucideComponent(CogIcon);
export const IconFileText = wrapLucideComponent(FileTextIcon);
export const IconGamepad = wrapLucideComponent(Gamepad2Icon);
export const IconLinkOff = wrapLucideComponent(Link2OffIcon);
export const IconPause = wrapLucideComponent(PauseIcon);
export const IconPercent = wrapLucideComponent(PercentIcon);
export const IconPlay = wrapLucideComponent(PlayIcon);
export const IconSmartphone = wrapLucideComponent(SmartphoneIcon);
export const IconTriangleAlert = wrapLucideComponent(TriangleAlertIcon);
export const IconVolume2 = wrapLucideComponent(Volume2Icon);
export const IconVolumeX = wrapLucideComponent(VolumeXIcon);
export const IconX = wrapLucideComponent(XIcon);
