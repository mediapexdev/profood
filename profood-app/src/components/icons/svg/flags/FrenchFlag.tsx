/**
 * 
 */
export const FrenchFlagString : string = 'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512"><rect width="170.67" height="512" fill="#41479B"/><rect x="170.67" width="170.67" height="512" fill="#F5F5F5"/><rect x="341.33" width="170.67" height="512" fill="#FF4B55"/><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>';

/**
 * 
 * @returns 
 */
const FrenchFlag: React.FC = () => {
    /**
     * 
     */
    return (
        <svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            // xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
	        viewBox="0 0 512 512"
            // style={{enableBackground:"new 0 0 512 512;"}}
            // xml:space="preserve"
        >
            <rect
                width="170.67"
                height="512"
                fill="#41479B"
            />
            <rect
                x="170.67"
                width="170.67"
                height="512"
                fill="#F5F5F5"
            />
            <rect
                x="341.33"
                width="170.67"
                height="512"
                fill="#FF4B55"
            />
            <g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>
        </svg>
    );
};

export default FrenchFlag;
