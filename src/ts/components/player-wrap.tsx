import './player-wrap.scss';
import { h, JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import { CreatePlayerOptions } from '@interfaces/player-interface';
import { createVideo, playerClose, streamPlay, playbackPlay } from 'dms-player';

import { LiveStreamControls } from '@src/ts/components/controls/live-stream-controls';
import { SaveVideoControls } from '@src/ts/components/controls/save-video-controls';
import { PtzButton } from './ptz/ptz-button';

import play from '@assets/img/play.svg';
import spinner from '@assets/img/spinner.svg';
import videoOff from '@assets/img/video-off.svg';

interface PlayerWrapProps {
    options: CreatePlayerOptions;
}

interface initPlayerOptions {
    id: string;
    url: string;
    srcType: string;
    stream: string;
    transcode: number;
    errorMsgFunc?: (err: {code: number; funcName: string; msg: string;} | boolean) => void;
}

export const PlayerWrap = (props: PlayerWrapProps): JSX.Element => {   
    const { options } = props;

    const [player, setPlayer] = useState<HTMLVideoElement | null>(null);
    const [playType, setPlayType] = useState('');
    const [playUrl, setPlayUrl] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [disconnnect, setDisconnect] = useState(false);
    const [displayClickPlay, setDisplayClickPlay] = useState(false);
    const [showPtzBtn, setShowPtzBtn] = useState(false);

    useEffect(() => {
        if (options.startDate && options.endDate) {
            setPlayType('save');
        } else {
            setPlayType('live');
        }
        initCreatePlayer();
        return () => {
            if (player && playUrl) {
                playerClose(player, playUrl);
            }
        };
    }, []);

    useEffect(() => {
        if (player && playType === 'live') {
            if (options.autoPlay) {   // 자동 재생 여부에 따라 재생 처리
                streamPlay(player);
            }
        }
        if (player && playType === 'save') {
            if (options.autoPlay) {    // 자동 재생 여부에 따라 재생 처리
                playbackPlay(player, options.startDate, options.endDate);
            }
        }
    }, [player]);

    /**
     * player 생성 옵션 정의
     */
    const initPlayerOptions = (): initPlayerOptions => {
        const protocol = options.protocol === 'http' ? 'ws://' : 'wss://';
        setPlayUrl(options.url);
        return {
            id: options.id,
            url: options.url,
            srcType: options.url.split(':///')[0],
            stream: `${protocol}${options.host}/media/api/v1/stream`,
            transcode: options.transcode,
            errorMsgFunc: ((err) => {
                // 사용자 정의 에러 콜백 호출
                if (options.errorMsgFunc) {
                    options.errorMsgFunc(err);
                }
                setDisconnect(!err);
                setIsPlaying(false);
			})
        };
    }

    /**
     * player 생성
     */
    const initCreatePlayer = (): void => {
        const playerEl = createVideo(initPlayerOptions());
        if (playerEl) {
            document.querySelector(`#${options.parentElementId} .dms-player-container`)?.append(playerEl);
            setPlayer(playerEl);
            playerEl?.addEventListener('playing', () => {
                setIsPlaying(true);
            });
        }
    };

    /**
     * player 화면 재생 버튼 클릭 이벤트
     */
    const onDisplayClickPlay = (): void => {
        if (player && playType === 'live') {
            setDisplayClickPlay(true);
        }
        if (player && playType === 'save') {
            setDisplayClickPlay(true);
        }
    }

    const togglePtzButtonControl = (isShow: boolean): void => {
        setShowPtzBtn(isShow);
    }

    return (
        <div className="dms-player-wrap">
            <div className="dms-player-container">
                {
                    player && showPtzBtn
                        ? <PtzButton propsPlayer={player} />
                        : null
                }
                {
                    !disconnnect  // disconnect 가 아닌 경우
                        ? !options.autoPlay && !isPlaying
                            ? <div className="dms-player-loading">
                                  <img className="play" onClick={() => onDisplayClickPlay()} src={play} alt="영상 재생 시작" />
                              </div>
                                : !disconnnect && !isPlaying
                                    ? <div className="dms-player-loading">
                                          <img className="spinner" src={spinner} alt="영상 로딩" />
                                      </div>
                                    : null
                        : null
                }
                {
                    disconnnect 
                        ? <div className="dms-player-disconnected">
                              <img src={videoOff} className="disconnected" alt="영상 끊김" />
                          </div>
                        : player 
                            ? playType === 'live'
                                ? <LiveStreamControls 
                                    propsTogglePtzButtonControl={togglePtzButtonControl}
                                    propsDisplayClickPlay={displayClickPlay}
                                    propsOptions={options}
                                    propsPlayer={player}
                                    propsPlayUrl={playUrl} />
                                : <SaveVideoControls 
                                    propsDisplayClickPlay={displayClickPlay}
                                    propsOptions={options}
                                    propsPlayer={player} 
                                    propsPlayUrl={playUrl} />
                            :  null
                }
            </div>
        </div>
    );
}