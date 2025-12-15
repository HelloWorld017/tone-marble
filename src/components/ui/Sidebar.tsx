import { animated, useTransition as useSpringTransition } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import { IconCog, IconFileText, IconGamepad, IconTriangleAlert } from '@/assets/icons/lucide';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { useLatestRef } from '@/hooks/useLatestRef';
import * as styles from './Sidebar.css';
import { Config } from './config/Config';
import { Controllers } from './controllers/Controllers';
import { Warning } from './warning/Warning';
import type { ReactNode } from 'react';

type TabKind = 'controllers' | 'config' | 'warning';

const TABS: Record<TabKind, ReactNode> = {
  warning: <Warning />,
  controllers: <Controllers />,
  config: <Config />,
};

export const Sidebar = () => {
  const [selectedTab, setSelectedTab] = useState<TabKind | null>(null);
  const selectedTabRef = useLatestRef(selectedTab);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const isPoweredOn = useInterfaceState(state => state.isPoweredOn);
  const isWarningOn = !isPoweredOn;

  useEffect(() => {
    if (!isWarningOn && selectedTab == 'warning') {
      setSelectedTab(null);
    }
  }, [isWarningOn, selectedTab]);

  useEffect(() => {
    const onClickOutside = (e: PointerEvent) => {
      if (rootRef.current === null || !(e.target instanceof Node)) {
        return;
      }

      if (selectedTabRef.current === null) {
        return;
      }

      if (!rootRef.current.contains(e.target)) {
        setSelectedTab(null);
      }
    };
    window.addEventListener('click', onClickOutside, { capture: true });
    return () => window.removeEventListener('click', onClickOutside, { capture: true });
  }, [selectedTabRef]);

  const transitions = useSpringTransition([selectedTab], {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    keys: kind => kind ?? '',
  });

  const renderAsideItem = (key: TabKind, icon: ReactNode) => (
    <button
      key={key}
      css={styles.asideItemStyle(selectedTab === key)}
      type="button"
      onClick={() => (selectedTab === key ? setSelectedTab(null) : setSelectedTab(key))}
    >
      {icon}
    </button>
  );

  return (
    <div ref={rootRef}>
      <aside css={styles.asideStyle}>
        {renderAsideItem('warning', <IconTriangleAlert strokeWidth={2} />)}
        <a href="./docs/" css={styles.asideItemStyle(false)}>
          <IconFileText strokeWidth={2} />
        </a>
        {renderAsideItem('controllers', <IconGamepad strokeWidth={2} />)}
        {renderAsideItem('config', <IconCog strokeWidth={2} />)}
      </aside>

      <main>
        {transitions(
          (style, kind) =>
            kind && (
              <animated.div css={styles.contentsStyle} style={style}>
                {TABS[kind]}
              </animated.div>
            )
        )}
      </main>
    </div>
  );
};
