import React from 'react';

import { useFullscreenModeContext } from '../contexts/FullscreenModeProvider';

import { Button } from 'reactstrap';

import { Fullscreen, FullscreenExit } from 'react-bootstrap-icons';

/**
 * 
 * @returns 
 */
const FullscreenModeController: React.FC = () => {
    /**
     * 
     */
    const {fullscreenEnabled, toggleFullsceenMode} = useFullscreenModeContext();

    /**
     * 
     */
    return (
        <Button
            tag='button'
            type='button'
            size="sm"
            id='fullscreenModeToggler'
            color="light"
            className="d-flex flex-center content-color w-40px h-40px"
            onClick={toggleFullsceenMode}
        >
        {
            !fullscreenEnabled
            ?
            <Fullscreen size={19} />
            :
            <FullscreenExit size={19} />
        }
        </Button>
    );
};

export default FullscreenModeController;
