import './playerWrap.scss';
import { h, JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import { CreatePlayerOptions } from '@interfaces/player-interface';
import { createVideo, playerClose, streamPlay, playbackPlay } from 'dms-player';

import { LiveStreamControls } from '@components/controls/liveStreamControls';
import { SaveVideoControls } from '@components/controls/saveVideoControls';

import { FontAwesomeIcon } from '@aduh95/preact-fontawesome';
import * as FasIcons from '@fortawesome/free-solid-svg-icons';
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
			})
        };
    }

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

    const onDisplayClickPlay = (): void => {
        if (player && playType === 'live') {
            setDisplayClickPlay(true);
        }
        if (player && playType === 'save') {
            setDisplayClickPlay(true);
        }
    }

    return (
        <div className="dms-player-wrap">
            <div className="dms-player-container">
                {
                    !options.autoPlay && !isPlaying
                        ? <div className="dms-player-loading">
                              <div onClick={() => onDisplayClickPlay()}>
                                  <FontAwesomeIcon icon={FasIcons['faPlay']} />
                              </div>
                          </div>
                        : !disconnnect && !isPlaying
                            ? <div className="dms-player-loading">
                                  <FontAwesomeIcon icon={FasIcons['faSpinner']} spin />
                              </div>
                            : null
                }
                {
                    disconnnect 
                        ? <div className="dms-player-disconnected">
                              <FontAwesomeIcon className="icon-btn" icon={FasIcons['faVideoSlash']} />
                          </div>
                        : player 
                            ? playType === 'live'
                                ? <LiveStreamControls 
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