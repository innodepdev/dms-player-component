import './live-stream-controls.scss';

import { h, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { CreatePlayerOptions } from '@interfaces/player-interface';
import { streamPlay, streamStop, playerClose, ptzModeOn, ptzModeOff, createDraggablePTZ, createAreaZoom, createPointMove } from 'dms-player';
import { exportImage } from '@src/ts/util/common';

import play from '@assets/img/play.svg';
import pause from '@assets/img/pause.svg';
import imageDownload from '@assets/img/image-download.svg';
import ctrlCamera from '@assets/img/control-camera.svg';
import expand from '@assets/img/expand.svg';
import reduce from '@assets/img/reduce.svg';

interface LiveStreamControlsProps {
    propsTogglePtzButtonControl: (isShow: boolean) => void;
    propsOptions: CreatePlayerOptions;
    propsPlayer: HTMLVideoElement | null;
    propsPlayUrl: string;
    propsDisplayClickPlay: boolean;
}

export const LiveStreamControls = (props: LiveStreamControlsProps): JSX.Element => {
    const {propsTogglePtzButtonControl, propsOptions, propsPlayer, propsPlayUrl, propsDisplayClickPlay} = props;

    const [player, setPlayer] = useState<HTMLVideoElement | null>(null);
    const [playUrl, setPlayUrl] = useState('');
    const [isPlay, setIsPlay] = useState<boolean | undefined>(propsOptions.autoPlay);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isShowPtzBtn, setIsShowPtzBtn] = useState(false);
    const [onPtz, setOnPtz] = useState<string | boolean>(false);

    const SIDE_PADDING = '1em';
    const CONTROL_AREA_CLASS = '.dms-player-live-stream-contorl';
    const PLAY_TITLE = '실시간 영상 재생';
    const PLAY_STOP_TITLE = '실시간 영상 정지';

    let escHandler: () => void;

    /**
     * use Effects
     */
    useEffect(() => {
        setControlAreaFadeInOut();
        setEscapeEvent();
        return () => {
            removeEscapeEvent();
            removePlayer();
        };
    }, []);

    useEffect(() => {
        if (propsPlayer) {
            setPlayer(propsPlayer);
            if (propsOptions.autoPlay) {
                setIsPlay(propsOptions.autoPlay);
            }
        }
    }, [propsPlayer]);

    useEffect(() => {
        if (propsPlayUrl) {
            setPlayUrl(propsPlayUrl);
        }
    }, [propsPlayUrl]);

    useEffect(() => {
        if (propsDisplayClickPlay) {
            setIsPlay(propsDisplayClickPlay);
        }
    }, [propsDisplayClickPlay]);

    useEffect(() => {
        if (player && propsOptions.buttonTooltip) {
            setBtnTooltipPosition();
        }
    }, [player])

    /**
     * 버튼 툴팁 위치 설정
     */
     const setBtnTooltipPosition = (): void => {
        // tooltip 영역 element
        const tooltip = document.querySelector(`#${propsOptions.parentElementId} ${CONTROL_AREA_CLASS} .btn-tooltip`) as HTMLDivElement; 
        // btn elements
        const ctrlBtns = document.querySelectorAll(`#${propsOptions.parentElementId} ${CONTROL_AREA_CLASS} .control-btn`);
        ctrlBtns.forEach((btn: Node) => {
            (btn as HTMLButtonElement).addEventListener('mouseenter', (e: MouseEvent) => {
                const target = e.target as HTMLButtonElement;
                const ariaLabel = target.ariaLabel;
                tooltip.style.display = 'block';
                tooltip.innerText = ariaLabel ? ariaLabel : '';

                const calcLeft = Number(`${target.offsetLeft + target.clientWidth / 2 - tooltip.clientWidth / 2}`);
                const calcRight = Number(`${target.offsetLeft + target.clientWidth + target.clientWidth / 2}`);
                
                // 전체 warp 영역 element & width
                const playerWrap = document.querySelector(`#${propsOptions.parentElementId} .dms-player-wrap`) as HTMLDivElement;
                const playerWrapWidth = playerWrap.clientWidth;

                if (calcLeft < 0) {
                    tooltip.style.right = '';
                    tooltip.style.left = SIDE_PADDING;
                } else if (calcRight > playerWrapWidth) {
                    tooltip.style.left = '';
                    tooltip.style.right = SIDE_PADDING;
                } else {
                    tooltip.style.right = '';
                    tooltip.style.left = `${calcLeft}px`;
                }
            });
            (btn as HTMLButtonElement).addEventListener('mouseleave', () => {
                tooltip.innerText = '';
                tooltip.style.left = '';
                tooltip.style.right = '';
                tooltip.style.display = 'none';
            });
        })
    };

    /**
     * 컨트롤 영역, fade in/out 이벤트 등록
     */
     const setControlAreaFadeInOut = (): void => {
        const playerWrap = document.querySelector(`#${propsOptions.parentElementId} .dms-player-wrap`) as HTMLDivElement;
        const playerCtrl = document.querySelector(`#${propsOptions.parentElementId} .dms-player-live-stream-contorl`) as HTMLDivElement;
        playerWrap.addEventListener('mouseenter', () => {
            playerCtrl.classList.remove('fade-out');
            playerCtrl.classList.add('fade-in');
        });
        playerWrap.addEventListener('mouseleave', () =>{
            playerCtrl.classList.remove('fade-in');
            playerCtrl.classList.add('fade-out');
            const ptzListWrap = document.querySelector('.ptz-list-wrap') as HTMLDivElement;
            if (ptzListWrap) {
                ptzListWrap.style.display = 'none';
            }
        });
    };

    /**
     * 전체화면 ESC 이벤트 Handler 등록
     */
    const setEscapeEvent = (): void => {
        const doc = window.document as Document & {
            webkitFullscreenElement(): Promise<void>
            mozFullScreenElement(): Promise<void>
            msFullscreenElement(): Promise<void>
        };
        escHandler = (): void => {
            if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
                setIsFullScreen(false);
            }
        };
        // Browser 타입 별 이벤트 리스너 등록
        document.addEventListener('fullscreenchange', escHandler);
        document.addEventListener('webkitfullscreenchange', escHandler);
        document.addEventListener('mozfullscreenchange', escHandler);
        document.addEventListener('MSFullscreenChange', escHandler);
    };

    /**
     * 전체화면 ESC 이벤트 Handler 삭제
     */
    const removeEscapeEvent = (): void => {
        // Browser 타입 별 이벤트 리스너 삭제
        document.removeEventListener('fullscreenchange', escHandler);
        document.removeEventListener('webkitfullscreenchange', escHandler);
        document.removeEventListener('mozfullscreenchange', escHandler);
        document.removeEventListener('MSFullscreenChange', escHandler);
    };

    /**
     * player 종료 및 삭제
     */
     const removePlayer = (): void => {
        if (player) {
            playerClose(player, playUrl);
            removePlayerElement();
        }
    };

    /**
     * player Element 삭제
     */
    const removePlayerElement = (): void => {
        const video = document.querySelector(`#${propsOptions.parentElementId} .dms-player-container video`);
        if (video) {
            video.remove();
        }
    };

     /**
     * 실시간 영상 재생
     */
    const liveStreamPlay = (): void => {
        if (player) {
            setIsPlay(true);
            streamPlay(player);
            // tooltip 영역 element
            const tooltip = document.querySelector(`#${propsOptions.parentElementId} ${CONTROL_AREA_CLASS} .btn-tooltip`) as HTMLDivElement; 
            tooltip.innerText = PLAY_STOP_TITLE;
        }
    };

    /**
     * 실시간 영상 정지
     */
    const liveStreamPause = (): void => {
        if (player) {
            setIsPlay(false);
            streamStop(player);
            // tooltip 영역 element
            const tooltip = document.querySelector(`#${propsOptions.parentElementId} ${CONTROL_AREA_CLASS} .btn-tooltip`) as HTMLDivElement; 
            tooltip.innerText = PLAY_TITLE;
        }
    };

    /**
     * 이미지 캡쳐 다운로드
     */
    const getVideoCaptureImage = (player: HTMLVideoElement | null): void => {
       exportImage(player)
    };

    /**
     * PTZ 제어 리스트 toggle
     */
    const togglePtzList = (e: Event): void => {
        const target = e.currentTarget as HTMLButtonElement;
        const ptzListWrap = document.querySelector(`#${propsOptions.parentElementId} .ptz-list-wrap`) as HTMLDivElement;
        const display = window.getComputedStyle(ptzListWrap, null).display;
        if (display === 'none') {
            ptzListWrap.style.display = 'block';
            target.style.opacity = '1';
            const calcLeft = Number(`${target.offsetLeft + target.clientWidth / 2 - ptzListWrap.clientWidth / 2}`);
            ptzListWrap.style.left = `${calcLeft}px`;
        } else {
            ptzListWrap.style.display = 'none';
            target.style.opacity = '';
        }
    };

    /**
     * PTZ 제어용 canvas 삭제
     */
    const removePtzCanvas = (): void => {
        const canvasEl = document.querySelector(`#${propsOptions.parentElementId} .dms-player-wrap canvas`) as HTMLCanvasElement;
        if (player && playUrl) {
            ptzModeOff(player, playUrl);
            canvasEl?.remove();
        }
    };

    /**
     * canvas 기반 (drag, area, point) ptz 실행
     */
    const onCanvasPtz = (canvas: HTMLCanvasElement) => {
        if (player && playUrl) {
            const playerWrap = document.querySelector(`#${propsOptions.parentElementId} .dms-player-wrap`) as HTMLDivElement;
            playerWrap.appendChild(canvas);
            ptzModeOn(player, playUrl);
        }
    };

    /**
     * 버튼 PTZ 제어 toggle
     */
    const toggleButtonPtzControl = (e: MouseEvent): void => {
        const target = e.currentTarget as HTMLButtonElement;
        const ariaLabel = target.ariaLabel;
        if (player && playUrl) {
            if (onPtz === ariaLabel) {
                ptzModeOff(player, playUrl)
                setOnPtz(false);
                setIsShowPtzBtn(false);
                propsTogglePtzButtonControl(false);
            } else {
                ptzModeOn(player, playUrl);
                setOnPtz(ariaLabel);
                setIsShowPtzBtn(!isShowPtzBtn);
                propsTogglePtzButtonControl(!isShowPtzBtn);
            }
        } 
    };

    /**
     * Drag PTZ 제어 toggle
     */
    const toggleDragPtzControl = (e: MouseEvent): void => {
        removePtzCanvas();
        const target = e.currentTarget as HTMLButtonElement;
        const ariaLabel = target.ariaLabel;
        if (player && playUrl) {
            if (onPtz === ariaLabel) {
                setOnPtz(false);
            } else {
                setIsShowPtzBtn(false);
                propsTogglePtzButtonControl(false);
                setOnPtz(ariaLabel);
                onCanvasPtz(createDraggablePTZ(player, '#fff'));
            }
        } 
    };

    /**
     * Area PTZ 제어 toggle
     */
    const toggleAreaPtzControl = (e: MouseEvent): void => {
        removePtzCanvas();
        const target = e.currentTarget as HTMLButtonElement;
        const ariaLabel = target.ariaLabel;
        if (player && playUrl) {
            if (onPtz === ariaLabel) {
                setOnPtz(false);
            } else {
                setIsShowPtzBtn(false);
                propsTogglePtzButtonControl(false);
                setOnPtz(ariaLabel);
                onCanvasPtz(createAreaZoom(player, '#fff'));
            }
        } 
    };

    /**
     * Point PTZ 제어 toggle
     */
    const togglePoinPtzControl = (e: MouseEvent): void => {
        removePtzCanvas();
        const target = e.currentTarget as HTMLButtonElement;
        const ariaLabel = target.ariaLabel;
        if (player && playUrl) {
            if (onPtz === ariaLabel) {
                setOnPtz(false);
            } else {
                setIsShowPtzBtn(false);
                propsTogglePtzButtonControl(false);
                setOnPtz(ariaLabel);
                onCanvasPtz(createPointMove(player));
            }
        } 
    };

    /**
     * toggle 전체화면/전체화면 종료
     */
    const toggleFullScreen = (): void => {
        const doc = window.document as Document & {
            mozCancelFullScreen(): Promise<void>
            webkitExitFullscreen(): Promise<void>
            msExitFullscreen(): Promise<void>
            mozFullScreenElement(): Promise<void>
            webkitFullscreenElement(): Promise<void>
            msFullscreenElement(): Promise<void>
        };
        const elem = document.querySelector(`#${propsOptions.parentElementId} .dms-player-wrap`) as HTMLDivElement & {
            mozRequestFullScreen(): Promise<void>;
            webkitRequestFullscreen(): Promise<void>;
            msRequestFullscreen(): Promise<void>;
        };

        const requestFullScreen = elem.requestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
        const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
      
        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            setIsFullScreen(true);
            requestFullScreen.call(elem);
        }
        else {
            setIsFullScreen(false);
            cancelFullScreen.call(doc);
        }
    };

    return (
        <div className="dms-player-live-stream-contorl">
            {
                propsOptions.buttonTooltip 
                    ? <div className="btn-tooltip"></div>
                    : null
            }
            {
                player 
                    ?   <div className="control-box-container">
                            <div className="left-controls control-box">
                                {
                                    isPlay 
                                    ? <button className="control-btn" onClick={() => liveStreamPause()} aria-label={PLAY_STOP_TITLE}>
                                        <img src={pause} alt={PLAY_STOP_TITLE} />
                                      </button>
                                    : <button className="control-btn" onClick={() => liveStreamPlay()} aria-label={PLAY_TITLE}>
                                        <img src={play} alt={PLAY_TITLE} />
                                      </button>
                                }
                                {
                                    propsOptions.capture
                                    ? <button className="control-btn" onClick={() => getVideoCaptureImage(player)} aria-label="실시간 영상 캡쳐">
                                        <img src={imageDownload} alt="실시간 영상 캡쳐" />
                                      </button>
                                    : null
                                }
                                {
                                    propsOptions.ptz
                                    ? <button className="control-btn" onClick={(e) => togglePtzList(e)} aria-label="PTZ 제어">
                                        <img src={ctrlCamera} alt="PTZ 제어" />
                                      </button>
                                    : null
                                }
                                {
                                    propsOptions.ptz
                                    ? <div className='ptz-list-wrap'>
                                        <ul>
                                            <li onClick={(e) => toggleButtonPtzControl(e)} aria-label="버튼 PTZ">
                                                <span >버튼 PTZ</span>
                                            </li>
                                            <li onClick={(e) => toggleDragPtzControl(e)} aria-label="드래그 PTZ">
                                                <span>드래그 PTZ</span>
                                            </li>
                                            <li onClick={(e) => toggleAreaPtzControl(e)} aria-label="영역 줌">
                                                <span>영역 줌</span>
                                            </li>
                                            <li onClick={(e) => togglePoinPtzControl(e)} aria-label="포인트 이동">
                                                <span>포인트 이동</span>
                                            </li>
                                        </ul>
                                      </div>
                                    : null
                                }
                                <span className="play-live">
                                    <div className="play-live-badge"></div>
                                    실시간
                                </span>
                                {
                                    onPtz 
                                        ? <span className="play-ptz">
                                            <div className="play-ptz-badge"></div>
                                            {onPtz}
                                          </span>
                                        : null
                                }
                            </div>
                            <div className="right-controls control-box">
                                {
                                    isFullScreen 
                                    ? <button className="control-btn" onClick={() => toggleFullScreen()} aria-label="전체화면 종료">
                                        <img src={reduce} alt="reduceScreen" />
                                      </button>
                                    : <button className="control-btn" onClick={() => toggleFullScreen()} aria-label="전체화면">
                                        <img src={expand} alt="expandScreen" />
                                      </button>
                                }
                            </div>
                        </div>
                    :   null
            }
        </div>
    );
}