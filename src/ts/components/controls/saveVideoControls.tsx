import './saveVideoControls.scss';

import { h, JSX } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';

import { playbackPlay, streamStop, playerClose } from 'dms-player';
import { exportImage, utcToDateString } from '@src/ts/util/common';

import { CreatePlayerOptions } from '@interfaces/player-interface';
import { SaveVideoProgressBar } from '@components/controls/saveVideoProgressBar';

import { FontAwesomeIcon } from '@aduh95/preact-fontawesome';
import * as FasIcons from '@fortawesome/free-solid-svg-icons';

interface SaveVideoControlsProps {
    propsOptions: CreatePlayerOptions;
    propsPlayer: HTMLVideoElement | null;
    propsPlayUrl: string;
    propsDisplayClickPlay: boolean;
}

export const SaveVideoControls = (props: SaveVideoControlsProps): JSX.Element => {
    const {propsOptions, propsPlayer, propsPlayUrl, propsDisplayClickPlay} = props;
    
    const [player, setPlayer] = useState<HTMLVideoElement|null>(null);
    const [playUrl, setPlayUrl] = useState('');
    const [playSpeed, setPlaySpeed] = useState(10);
    const [isPlay, setIsPlay] = useState<boolean|undefined>(propsOptions.autoPlay);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [playTimeInterval, setPlayTimeInterval] = useState(0);
    const [currentDate, setCurrentDate] = useState(propsOptions.startDate);

    const refIsPlay = useRef(propsOptions.autoPlay);       // 이벤트 리스너 콜백에서 변경된 date state 값을 가져오기 위한 ref 객체

    let escHandler: () => void;
    let playingHandler: () => void;
    let playing = false;

    /**
     * use Effects
     */
    useEffect(() => {
        setControlAreaFadeInOut();
        setEscapeEvent();
        return () => {
            removeEscapeEvent();
            clearTimeEvent();
            removePlayer();
        };
    }, []);

    useEffect(() => {
        if (propsPlayer) {
            setPlayer(propsPlayer);
            if (propsOptions.autoPlay) {
                setIsPlay(propsOptions.autoPlay); 
                startTimeEvent(propsPlayer);
            }
        }
    }, [propsPlayer]);

    useEffect(() => {
        if (propsPlayUrl) {
            setPlayUrl(propsPlayUrl);
        }
    }, [propsPlayUrl]);

    useEffect(() => {
        saveVideoPause();
        saveVideoPlay();
    }, [playSpeed]);

    useEffect(() => {
        if (propsDisplayClickPlay) {
            setIsPlay(propsDisplayClickPlay);
            saveVideoPlay();
        }
    }, [propsDisplayClickPlay]);

    /**
     * 컨트롤 영역, fade in/out 이벤트 등록
     */
    const setControlAreaFadeInOut = (): void => {
        const playerWrap = document.querySelector(`#${propsOptions.parentElementId} .dms-player-wrap`) as HTMLDivElement;
        const playerCtrl = document.querySelector(`#${propsOptions.parentElementId} .dms-player-save-video-contorl`) as HTMLDivElement;
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
     * 저장 영상 progressbar 처리용, intervar time event 시작
     */
    const startTimeEvent = (player: HTMLVideoElement): void => {
        const intervalSpeed = 1000 / (playSpeed / 10);
        playingHandler = (): void =>{
            if(!playing) {
                playing = true;
                setPlayTimeInterval(
                    window.setInterval(() => {
                        setCurrentDate((currentDate) => {
                            if (currentDate && propsOptions.endDate && currentDate < propsOptions.endDate) {
                                return currentDate as number + 1
                            } else {
                                clearInterval(playTimeInterval);
                                return currentDate;
                            }
                        });
                    }, intervalSpeed)
                );
            }
        }
        player?.addEventListener('playing', playingHandler);
    };

    /**
     * 저장 영상 progressbar 처리용, intervar time event 삭제
     */
    const clearTimeEvent = (): void => {
        playing = false;
        clearInterval(playTimeInterval);                        // interval clear
        setPlayTimeInterval(0);                                 // interval state reset
        player?.removeEventListener('playing', playingHandler); // event listener clear
    };

     /**
     * progressBar(child component) 변경에 따른 선택 시간 셋팅
     */
    const onChangeCurrentDate = (changeDate: number): void => {
        setCurrentDate(changeDate);
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
     * 저장 영상 재생
     */
    const saveVideoPlay = (playDate?: number): void => {
        if (player) {
            setIsPlay(true);
            refIsPlay.current = true;
            playbackPlay(player, playDate ? playDate : propsOptions.startDate, propsOptions.endDate, playSpeed);
            startTimeEvent(player);
        }
    };

    const setIncreasePlaySpeed = (): void => {
        switch (playSpeed) {
            case 10: 
                setPlaySpeed(20);
                break;
            case 20: 
                setPlaySpeed(40);
                break;
            case 40: 
                setPlaySpeed(10);
                break;
            default: break;
        }
    };

    /**
     * 저장 영상 정지
     */
    const saveVideoPause = (): void => {
        if (player) {
            setIsPlay(false);
            refIsPlay.current = false;
            streamStop(player);
            clearTimeEvent();
        }
    };

      /**
     * 이미지 캡쳐 다운로드
     */
    const getVideoCaptureImage = (player: HTMLVideoElement | null): void => {
        exportImage(player)
    }

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
        <div className="dms-player-save-video-contorl">
            {
                player 
                ?   <SaveVideoProgressBar 
                        propsOptions={propsOptions}
                        currentDate={currentDate}
                        clearTimeEvent={clearTimeEvent}
                        onChangeCurrentDate={onChangeCurrentDate}
                        saveVideoPause={saveVideoPause}
                        saveVideoPlay={saveVideoPlay}
                    />
                :   null
            }
            <div className="control-box-container">
                <div className="left-controls control-box">
                    {
                        isPlay 
                        ? <button className="ltr-btn" onClick={() => saveVideoPause()} aria-label="저장 영상 정지">
                            <FontAwesomeIcon className="icon-btn" icon={FasIcons['faPause']} />
                        </button>
                        : <button className="ltr-btn" onClick={() => saveVideoPlay(currentDate)} aria-label="저장 영상 재생">
                            <FontAwesomeIcon className="icon-btn" icon={FasIcons['faPlay']} />
                        </button>
                    }
                    <button className="ltr-btn" style={{fontSize: '1.8em'}} onClick={() => setIncreasePlaySpeed()} aria-label="저장 영상 배속 재생">
                        <FontAwesomeIcon className="icon-btn" icon={FasIcons['faAngleDoubleRight']} />
                    </button>
                    {
                        propsOptions.capture
                        ? <button className="ltr-btn" onClick={() => getVideoCaptureImage(player)} aria-label="저장 영상 캡쳐">
                            <FontAwesomeIcon className="icon-btn" icon={FasIcons['faDownload']} />
                          </button>
                        : null
                    }
                    <div className="play-speed">
                        x{(playSpeed / 10).toFixed(1)}
                    </div>
                </div>
                <div className="center-controls control-box">
                    {utcToDateString(currentDate)} / {utcToDateString(propsOptions.endDate)}
                </div>
                <div className="right-controls control-box">
                    {
                        propsOptions.searchDate
                        ?   <button className="ltr-btn">
                                <FontAwesomeIcon className="icon-btn" icon={FasIcons['faFilm']} />
                            </button>
                        :   null
                    }
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
        </div>
    );
}