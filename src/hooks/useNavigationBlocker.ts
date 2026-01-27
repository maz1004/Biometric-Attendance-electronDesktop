import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export function useNavigationBlocker(when: boolean) {
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }: { currentLocation: any; nextLocation: any }) =>
            when && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === 'blocked') {
            const confirmLeave = window.confirm(
                'You have unsaved changes. Are you sure you want to leave?'
            );
            if (confirmLeave) {
                blocker.proceed();
            } else {
                blocker.reset();
            }
        }
    }, [blocker]);
}
