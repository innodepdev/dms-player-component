import './LiveStreamControls.scss';

import { h, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { CreatePlayerOptions } from '@interfaces/player-interface';
import { streamPlay, streamStop, playerClose } from 'dms-player';
import { exportImage } from '@src/ts/util/common';

import { FontAwesomeIcon } from '@aduh95/preact-fontawesome';
import * as FasIcons from '@fortawesome/free-solid-svg-icons';

interface LiveStreamControlsProps {
    propsOptions: CreatePlayerOptions;
    propsPlayer: HTMLVideoElement | null;
    propsPlayUrl: string;
    propsDisplayClickPlay: boolean;
}

export const LiveStreamControls = (props: LiveStreamControlsProps): JSX.Element => {
    const {propsOptions, propsPlayer, propsPlayUrl, propsDisplayClickPlay} = props;

    const [player, setPlayer] = useState<HTMLVideoElement | null>(null);
    const [playUrl, setPlayUrl] = useState('');
    const [isPlay, setIsPlay] = useState<boolean | undefined>(propsOptions.autoPlay);
    const [isFullScreen, setIsFullScreen] = useState(false);

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
        }
    };

    /**
     * 실시간 영상 정지
     */
    const liveStreamPause = (): void => {
        if (player) {
            setIsPlay(false);
            streamStop(player);
        }
    };

    /**
     * 이미지 캡쳐 다운로드
     */
    const getVideoCaptureImage = (player: HTMLVideoElement | null): void => {
       exportImage(player)
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
        <div className="dms-player-live-stream-contorl fade-out">
            {
                player 
                    ?   <div className="control-box-container">
                            <div className="left-controls control-box">
                                {
                                    isPlay 
                                    ? <button className="ltr-btn" onClick={() => liveStreamPause()} aria-label="실시간 영상 정지">
                                        <FontAwesomeIcon className="icon-btn" icon={FasIcons['faPause']} />
                                    </button>
                                    : <button className="ltr-btn" onClick={() => liveStreamPlay()} aria-label="실시간 영상 재생">
                                        <FontAwesomeIcon className="icon-btn" icon={FasIcons['faPlay']} />
                                    </button>
                                }
                                <button className="ltr-btn" onClick={() => getVideoCaptureImage(player)} aria-label="실시간 영상 캡쳐">
                                    <FontAwesomeIcon className="icon-btn" icon={FasIcons['faDownload']} />
                                </button>
                            </div>
                            <div className="control-box"></div>
                            <div className="right-controls control-box">
                                {
                                    isFullScreen
                                    ? <button className="ltr-btn reduce-screen-btn" onClick={() => toggleFullScreen()} aria-label="전체화면 종료">
                                        <FontAwesomeIcon className="icon-btn" icon={FasIcons['faCompress']}/>
                                    </button>
                                    : <button className="ltr-btn expand-screen-btn" onClick={() => toggleFullScreen()} aria-label="전체화면">
                                        <FontAwesomeIcon className="icon-btn" icon={FasIcons['faExpand']}/>
                                    </button>
                                }
                            </div>
                        </div>
                    :   null
            }
        </div>
    );
}