/**
 * 
 */
export const MenuBurgerTogglerIconString : string = 'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z" fill="currentColor"/><path opacity="0.3" d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z" fill="currentColor"/></svg>';

/**
 * 
 */
export const MenuHorizontalEllipsisTogglerIconString : string = 'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="4" height="4" rx="2" fill="currentColor"/><rect x="17" y="10" width="4" height="4" rx="2" fill="currentColor"/><rect x="3" y="10" width="4" height="4" rx="2" fill="currentColor"/></svg>';

/**
 * 
 */
export const MenuVerticalEllipsisTogglerIconString : string = 'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="4" height="4" rx="2" fill="currentColor"/><rect x="10" y="3" width="4" height="4" rx="2" fill="currentColor"/><rect x="10" y="17" width="4" height="4" rx="2" fill="currentColor"/></svg>';


/**
 * 
 */
export type MenuTogglerIconStyle = 'Burger' | 'HorizontalEllipsis' | 'VerticalEllipsis';

/**
 * 
 */
export interface MenuTogglerIconProps {
    style: MenuTogglerIconStyle;
};


/**
 * 
 * @returns 
 */
const MenuTogglerIcon: React.FC<MenuTogglerIconProps> = (prop : MenuTogglerIconProps) => {
    /**
     * 
     */
    switch(prop.style){
        case "Burger" as MenuTogglerIconStyle:
            default:
                return (
                    <>
                        {/* begin::Svg Icon | path: www/preview.keenthemes.com/kt-products/docs/metronic/html/releases/2023-03-24-172858/core/html/src/media/icons/duotune/abstract/abs015.svg */}
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z"
                                fill="currentColor"
                                />
                            <path
                                opacity="0.3"
                                d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z"
                                fill="currentColor"
                                />
                        </svg>
                        {/* end::Svg Icon */}
                    </>
                );
            case "HorizontalEllipsis" as MenuTogglerIconStyle:
                return (
                    <>
                        {/* begin::Svg Icon | path: www/preview.keenthemes.com/kt-products/docs/metronic/html/releases/2023-03-24-172858/core/html/src/media/icons/duotune/general/gen052.svg */}
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                x="10"
                                y="10"
                                width="4"
                                height="4"
                                rx="2"
                                fill="currentColor"
                            />
                            <rect
                                x="17"
                                y="10"
                                width="4"
                                height="4"
                                rx="2"
                                fill="currentColor"
                            />
                            <rect
                                x="3"
                                y="10"
                                width="4"
                                height="4"
                                rx="2"
                                fill="currentColor"
                            />
                        </svg>
                        {/* end::Svg Icon */}
                    </>
                );
            case "VerticalEllipsis" as MenuTogglerIconStyle:
                return (
                    <>
                        {/* begin::Svg Icon | path: www/preview.keenthemes.com/kt-products/docs/metronic/html/releases/2023-03-24-172858/core/html/src/media/icons/duotune/general/gen053.svg */}
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                x="10"
                                y="10"
                                width="4"
                                height="4"
                                rx="2"
                                fill="currentColor"
                            />
                            <rect
                                x="10"
                                y="3"
                                width="4"
                                height="4"
                                rx="2"
                                fill="currentColor"
                            />
                            <rect
                                x="10"
                                y="17"
                                width="4"
                                height="4"
                                rx="2"
                                fill="currentColor"/>
                        </svg>
                        {/* end::Svg Icon */}
                    </>
                );
    }
};

export default MenuTogglerIcon;
