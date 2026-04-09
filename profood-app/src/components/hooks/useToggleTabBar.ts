/**
 * 
 * @returns 
 */
const useToggleTabBar = () => {
    /**
     * 
     * @param show 
     */
    const toggleTabBar = (show: boolean): void => {

        const tabBar = document.getElementById('mainTabBar');

        if (tabBar !== null) {
            tabBar.style.display = (show) ? 'flex' : 'none';
        }
    };
    return toggleTabBar;
};

export default useToggleTabBar;
