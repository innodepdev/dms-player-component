import './ptz-button.scss';
import { h, JSX } from 'preact';

import { 
    ptzUp,
    ptzUpRight,
    ptzRight,
    ptzDownRight,
    ptzDown,
    ptzDownLeft,
    ptzLeft,
    ptzUpLeft,
    ptzStop,
    ptzZoomIn,
    ptzZoomOut
} from 'dms-player';

import top from '@assets/img/arrows/arrow-top.svg';
import topRight from '@assets/img/arrows/arrow-top-right.svg';
import right from '@assets/img/arrows/arrow-right.svg';
import bottomRight from '@assets/img/arrows/arrow-bottom-right.svg';
import bottom from '@assets/img/arrows/arrow-bottom.svg';
import bottomLeft from '@assets/img/arrows/arrow-bottom-left.svg';
import left from '@assets/img/arrows/arrow-left.svg';
import topLeft from '@assets/img/arrows/arrow-top-left.svg';
import zoomIn from '@assets/img/zoom-in.svg';
import zoomOut from '@assets/img/zoom-out.svg';


interface PtzButtonProps {
    propsPlayer: HTMLVideoElement | null;
}

export const PtzButton = (props: PtzButtonProps): JSX.Element => {
    const {propsPlayer} = props;
    const PTZ_SPEED =  5;

    /*
    // 원형 calculate
    useEffect(() => {
        const items = document.querySelectorAll('.circle-wrap .ptz-btn') as NodeListOf<HTMLButtonElement>;
        items.forEach((item: HTMLButtonElement, idx: number) => {
            item.style.left = (50 - 35 * Math.cos(-0.5 * Math.PI - 2*(1 / items.length) * idx * Math.PI)).toFixed(4) + "%";
            item.style.top = (50 + 35 * Math.sin(-0.5 * Math.PI - 2*(1 / items.length) * idx * Math.PI)).toFixed(4) + "%";
        });
    }, []);
    */

    const handlePtzBtnMouseDown = (e: MouseEvent): void => {
        if (propsPlayer) {
            const target = e.currentTarget as HTMLButtonElement;
            const ariaLabel = target.ariaLabel;
            switch(ariaLabel) {
                case 'top':
                    ptzUp(propsPlayer, PTZ_SPEED);
                    break;
                case 'topRight':
                    ptzUpRight(propsPlayer, PTZ_SPEED);
                    break;
                case 'right':
                    ptzRight(propsPlayer, PTZ_SPEED);
                    break;
                case 'bottomRight':
                    ptzDownRight(propsPlayer, PTZ_SPEED);
                    break;
                case 'bottom':
                    ptzDown(propsPlayer, PTZ_SPEED);
                    break;
                case 'bottomLeft':
                    ptzDownLeft(propsPlayer, PTZ_SPEED);
                    break;
                case 'left':
                    ptzLeft(propsPlayer, PTZ_SPEED);
                    break;
                case 'topLeft':
                    ptzUpLeft(propsPlayer, PTZ_SPEED);
                    break;
                default:
                        break;
            }
        }
    }

    const handlePtzBtnMouseUp = (): void => {
        if (propsPlayer) {
            ptzStop(propsPlayer);
        }
    }

    const handleZoomInBtnMouseDown = (): void => {
        if (propsPlayer) {
            ptzZoomIn(propsPlayer, PTZ_SPEED);
        }
    }

    const handleZoomOutBtnMouseDown = (): void => {
        if (propsPlayer) {
            ptzZoomOut(propsPlayer, PTZ_SPEED);
        }
    }

    return (
        <div className='ptz-btn-wrap'>
            <div className="circle-wrap">
                <button className="ptz-btn" 
                        aria-label="top" 
                        onMouseDown={(e) => handlePtzBtnMouseDown(e)} 
                        onMouseUp={() => handlePtzBtnMouseUp()}
                        style={{left: '50%', top: '15%'}}
                >
                    <img src={top} alt="top button" />
                </button>
                <button className="ptz-btn" 
                        aria-label="topRight" 
                        onMouseDown={(e) => handlePtzBtnMouseDown(e)} 
                        onMouseUp={() => handlePtzBtnMouseUp()}
                        style={{left: '74.7487%', top: '25.2513%'}}
                >
                    <img src={topRight} alt="topRight button" />
                </button>
                <button className="ptz-btn" 
                        aria-label="right" 
                        onMouseDown={(e) => handlePtzBtnMouseDown(e)} 
                        onMouseUp={() => handlePtzBtnMouseUp()}
                        style={{left: '85%', top: '50%'}}
                >
                    <img src={right} alt="right button" />
                </button>
                <button className="ptz-btn" 
                        aria-label="bottomRight" 
                        onMouseDown={(e) => handlePtzBtnMouseDown(e)} 
                        onMouseUp={() => handlePtzBtnMouseUp()}
                        style={{left: '74.7487%', top: '74.7487%'}}
                >
                    <img src={bottomRight} alt="bottomRight button" />
                </button>
                <button className="ptz-btn" 
                        aria-label="bottom" 
                        onMouseDown={(e) => handlePtzBtnMouseDown(e)} 
                        onMouseUp={() => handlePtzBtnMouseUp()}
                        style={{left: '50%', top: '85%'}}
                >
                    <img src={bottom} alt="bottom button" />
                </button>
                <button className="ptz-btn" 
                        aria-label="bottomLeft" 
                        onMouseDown={(e) => handlePtzBtnMouseDown(e)} 
                        onMouseUp={() => handlePtzBtnMouseUp()}
                        style={{left: '25.2513%', top: '74.7487%'}}
                >
                    <img src={bottomLeft} alt="bottomLeft button" />
                </button>
                <button className="ptz-btn" 
                        aria-label="left" 
                        onMouseDown={(e) => handlePtzBtnMouseDown(e)} 
                        onMouseUp={() => handlePtzBtnMouseUp()}
                        style={{left: '15%', top: '50%'}}
                >
                    <img src={left} alt="left button" />
                </button>
                <button className="ptz-btn" 
                        aria-label="topLeft" 
                        onMouseDown={(e) => handlePtzBtnMouseDown(e)} 
                        onMouseUp={() => handlePtzBtnMouseUp()}
                        style={{left: '25.2513%', top: '25.2513%'}}
                >
                    <img src={topLeft} alt="topLeft button" />
                </button>
            </div>
            <div className="menu-button">
                <button className="zoom-btn" 
                        aria-label="zoom in" 
                        onMouseDown={() => handleZoomInBtnMouseDown()}
                        onMouseUp={() => handlePtzBtnMouseUp()}
                >
                    <img src={zoomIn} alt="zoom in" />
                </button>
                <button className="zoom-btn" 
                        aria-label="zoom out"
                        onMouseDown={() => handleZoomOutBtnMouseDown()}
                        onMouseUp={() => handlePtzBtnMouseUp()}
                >
                    <img src={zoomOut} alt="zoom out" />
                </button>
            </div>
        </div>
    )
};