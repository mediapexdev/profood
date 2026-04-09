import {
    ClearIndicatorProps,
    components,
    ControlProps,
    DropdownIndicatorProps,
    OptionProps,
    PlaceholderProps,
    CSSObjectWithLabel,
    ValueContainerProps,
    MenuListProps,
    MenuProps
} from 'react-select';

import { Label } from 'reactstrap';

/**
 * 
 */
export const customSelectStyles = {
    control: (defaultStyles: CSSObjectWithLabel) => ({
        ...defaultStyles,
        height: 'calc(3.5rem + calc(var(--bs-border-width) * 2))',
        minHeight: 'calc(3.5rem + calc(var(--bs-border-width) * 2))',
        lineHeight: '1.25',
        fontSize: '1rem',
        fontWeight: '400',
        backgroundColor: '#f6f6f6',
        color: 'var(--body-color)',
        backgroundClip: 'padding-box',
        borderColor: 'transparent',
        borderRadius: 'var(--bs-border-radius)',
        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
        boxShadow: 'none !important',
        cursor: 'text !important',

        '&[aria-disabled="true"]': {
            color: 'hsl(0, 0%, 45%) !important',
            cursor: 'not-allowed !important',
            // pointerEvent: 'unset', 
            // backgroundColor: '#f6f6f7',
            // backgroundColor: 'transparent',
            opacity: 0.3
        },
        '&:focus': {
            borderColor: 'var(--bs-success)',
            backgroundColor: '#f0f0f0 !important'
        },
        '&:active': {
            borderColor: 'var(--bs-success)',
            backgroundColor: '#f0f0f0 !important'
        },
        '&:hover': {
            borderColor: 'var(--bs-success)'
        }
    }),
    clearIndicator: (defaultStyles: CSSObjectWithLabel) => ({
        ...defaultStyles,
        color: 'inherit',
        opacity: 0.6,
        '&:hover': {
            color: 'inherit',
            opacity: 0.8,
            cursor: 'pointer'
        }
    }),
    dropdownIndicator: (defaultStyles: CSSObjectWithLabel) => ({
        ...defaultStyles,
        color: 'inherit',
        opacity: 0.6,
        '&:hover': {
            color: 'inherit',
            opacity: 0.8,
            cursor: 'pointer'
        }
    }),
    indicatorSeparator: (defaultStyles: CSSObjectWithLabel) => ({
        ...defaultStyles,
        backgroundColor: 'rgba(var(--body-color-rgb), 0.10)'
    }),
    menuPortal: (defaultStyles: CSSObjectWithLabel) => ({
        ...defaultStyles,
        boxShadow: '0px 0px 50px 0px rgba(82, 63, 105, 0.15)',
        zIndex: 9999
    }),
    option: (defaultStyles: CSSObjectWithLabel,
        state: {
            data: any;
            isDisabled: boolean;
            isFocused: boolean;
            isSelected: boolean;
        }
    ) => ({
        ...defaultStyles,
        color: state.isSelected || state.isFocused ? '#fff' : defaultStyles.color,
        backgroundColor: state.isSelected ? 'rgba(226, 150, 59, 0.88)' : (state.isFocused ? 'rgba(226, 150, 59, 0.36)' : defaultStyles.backgroundColor),
        '&:active': {
            backgroundColor: '#e2963b'
        }
    }),
    placeholder: (defaultStyles: CSSObjectWithLabel) => ({
        ...defaultStyles,
        color: 'inherit'
    }),
    singleValue: (defaultStyles: any) => ({ ...defaultStyles, color: "inherit" }),
};

/**
 * 
 * @param param0 
 * @returns 
 */
export const customSelectClearIndicator = ({ children , ...props }: ClearIndicatorProps) => (
    <components.ClearIndicator
        {...props}
        className='select-clear-indicator'
    >
        {children}
    </components.ClearIndicator>
);

/**
 * 
 * @param param0 
 * @returns 
 */
export const customSelectDropdownIndicator = ({ children , ...props }: DropdownIndicatorProps) => (
    <components.DropdownIndicator
        {...props}
        className='select-dropdown-indicator'
    >
        {children}
    </components.DropdownIndicator>
);

/**
 * 
 * @param param0 
 * @returns 
 */
export const customSelectPlaceholder = ({ children , ...props }: PlaceholderProps) => (
    <components.Placeholder
        {...props}
        className='select-placeholder'
    >
        {children}
    </components.Placeholder>
);

/**
 * 
 * @param param0 
 * @returns 
 */
export const customSelectValueConatiner = ({ children , ...props }: ValueContainerProps) => (
    <components.ValueContainer
        {...props}
        className={`select-value-container`}
    >
        {children}
        <Label className={`select-label`}>{props.selectProps.placeholder?.toString()}</Label>
    </components.ValueContainer>
);

/**
 * 
 * @param param0 
 * @returns 
 */
export const customSelectControl = ({ children , ...props }: ControlProps) => (
    <components.Control
        {...props}
        className={`select-input ${props.isFocused || props.hasValue ? 'floating':''}`}
    >
        {children}
    </components.Control>
);

/**
 * 
 * @param param0 
 * @returns 
 */
export const customSelectOption = ({ children , ...props }: OptionProps) => (
    <components.Option
        {...props}
        className='select-option'
    >
        {children}
    </components.Option>
);

/**
 * 
 * @param param0 
 * @returns 
 */
export const customSelectMenu = ({ ...props }: MenuProps) => (
    <components.Menu
        {...props}
        className='select-menu'
    >
        {props.children}
    </components.Menu>
)
;
/**
 * 
 * @param param0 
 * @returns 
 */
export const customSelectMenuList = ({ ...props }: MenuListProps) => (
    <components.MenuList
        {...props}
        className='select-menu-list'
    >
        {props.children}
    </components.MenuList>
);
