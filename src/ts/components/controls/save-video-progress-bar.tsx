import './save-video-progress-bar.scss';
import {h, JSX} from 'preact';
import {useEffect, useState, useRef} from 'preact/hooks';

import {CreatePlayerOptions} from '@interfaces/player-interface';
import {NewHttpInterface} from '@service/http-interface';

import moment from 'moment';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {utcToDateString} from '@src/ts/util/common';

interface SaveVideoProgressBarProps {
    propsOptions: CreatePlayerOptions;
    currentDate: number | undefined;
    clearTimeEvent: () => void;
    onChangeCurrentDate: (changeDate: number) => void;
    saveVideoPlay: (playOption: {date: number|undefined; speed: number}) => void;
    saveVideoPause: () => void;
    propsPlaySpeed: number;
}

export const SaveVideoProgressBar = (props: SaveVideoProgressBarProps): JSX.Element => {
    const {propsOptions, currentDate, clearTimeEvent, onChangeCurrentDate, saveVideoPlay, saveVideoPause, propsPlaySpeed} = props;
    const [playDate, setPlayDate] = useState(currentDate);
    const [playSpeed, setPlaySpeed] = useState(propsPlaySpeed);
    const [scaleArray, setScaleArray] = useState({});
    const [snapShotUrl, setSnapShotUrl] = useState<string>();

    const refPlayDate = useRef(playDate);       // 이벤트 리스너 콜백에서 변경된 date state 값을 가져오기 위한 ref 객체
    const refPlaySpeed = useRef(playSpeed);

    const httpService = NewHttpInterface();     // http service 객체 생성
    
    useEffect(() => {
        if (propsOptions.scale) {
            setScaleDisplay();
        }
        setSliderMouseEvent();
    }, []);

    useEffect(() => {
        setPlayDate(currentDate);
        refPlayDate.current = currentDate;
        if (currentDate && propsOptions.endDate && currentDate >= propsOptions.endDate) {
            clearTimeEvent();
            saveVideoPause();
        }
    }, [currentDate]);

    useEffect(() => {
        setPlaySpeed(propsPlaySpeed);
        refPlaySpeed.current = propsPlaySpeed;
    }, [propsPlaySpeed]);

    /**
     * scale 화면 표시 처리
     */
    const setScaleDisplay = (): void => {
        if (propsOptions.startDate && propsOptions.endDate && propsOptions.scale) {
            const scale = propsOptions.scale - 1;
            const beetween = propsOptions.endDate - propsOptions.startDate;
            const beetweenCnt = Math.round(beetween / scale);
            const marks = {
                [propsOptions.startDate]: utcToDateString(propsOptions.startDate)
            };
            for(let i = 1; i <= scale; i++) {
                const calcValue = propsOptions.startDate + (beetweenCnt * (i - 1));
                marks[calcValue] = utcToDateString(calcValue);
            }
            marks[propsOptions.endDate] = utcToDateString(propsOptions.endDate)
            setScaleArray(marks)
        }
    }

    /**
     * slider 값 변경 이벤트 콜백 (mouse/keyboard)
     */
    const sliderChangeCallback = () => {
        clearTimeEvent();
        saveVideoPause();
        const playOption = {
            date: refPlayDate.current,
            speed: refPlaySpeed.current
        };
        saveVideoPlay(playOption);
        window.removeEventListener('mouseup', sliderChangeCallback);
    };

    /**
     * slider 객체 MouseMove 이벤트 콜백
     */
     const onMouseMoveSlider = (e: MouseEvent): void => {
        if (propsOptions.startDate && propsOptions.endDate) {
            const slider = e.currentTarget as HTMLDivElement;
            const offsetX = e.clientX - slider.getBoundingClientRect().left;
            const percents = (offsetX / slider.clientWidth) * 100;             // 백분율 구하기
            const min = propsOptions.startDate;                                             // range 최소 값
            const max = propsOptions.endDate;                                               // max 최대 값
            const value = (percents * (max - min) / 100) + min;                // 현재 마우스가 위치한 곳의 value
            onMouseMoveSnpashotPosition(value);
        }
	};

    /**
     * slider 객체 MouseOut 이벤트 콜백
     */
    const onMouseOutSlider = (): void => {
        const progressBarValue = document.querySelector(`#${propsOptions.parentElementId} #progressBarValue`) as HTMLElement;
        progressBarValue.style.display = 'none';
    };

     /**
     * slider 객체 onChange 이벤트 콜백
     */
    const onChangeSlider = (changeValue: number): void => {
        setPlayDate(changeValue);
        onChangeCurrentDate(changeValue);
        onMouseMoveSnpashotPosition(changeValue)
        clearTimeEvent();
	};

    /**
     * slider 객체 mouse 이벤트 등록
     */
    const setSliderMouseEvent = (): void => {
        const slider = document.querySelector(`#${propsOptions.parentElementId} .rc-slider`) as HTMLDivElement;
        if (slider) {
            slider.addEventListener('mousemove', (e: MouseEvent) => {
                onMouseMoveSlider(e);
            });
            slider.addEventListener('mouseleave', () => {
                onMouseOutSlider();
            });
            slider.addEventListener('mouseup', sliderChangeCallback);
        }
        // rc-slider-handle
        const sliderHandle = document.querySelector(`#${propsOptions.parentElementId} .rc-slider-handle`) as HTMLDivElement;
        if (sliderHandle) {
            sliderHandle.addEventListener('mousedown', () => {
                window.addEventListener('mouseup', sliderChangeCallback);
            });
            sliderHandle.addEventListener('keydown', (event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            });
        }
    };

    const getSnapShot = async(dateTime: number) => {
        const splitUrl = propsOptions.url.split(':///');
        const cctvId = splitUrl[1];
        const url = `/media/api/v1/snapshot/${splitUrl[0]}/${cctvId}/${480}?time=${dateTime}`;
        const res = await httpService?.getSnapShot(url);
        if (res) {
            const reader = new FileReader();
            reader.readAsDataURL(res);
            reader.onload = (event: ProgressEvent<FileReader>) => {
                if (typeof event.target?.result === 'string') {
                    setSnapShotUrl(event.target?.result); 
                }
            }   
        }
    };

    /**
     * slider 마우스 이벤트 관련, 스냅샷 표출 영역 위치 정의 함수
     */
    const onMouseMoveSnpashotPosition = (value: number): void => {
        if (propsOptions.snapshot && propsOptions.startDate && propsOptions.endDate) {
            getSnapShot(Number(value.toFixed(0)));

            const newValue = Number((+value - propsOptions.startDate) * 100 / (propsOptions.endDate - propsOptions.startDate));
            const newPosition = 5 - (newValue * 0.1);
            const leftValue = `calc(${newValue}% + (${newPosition}px))`;
            
            const dateConvert = moment(new Date(Number(value.toFixed(0) + '000'))).format('HH:mm:ss');
            const progressBarValue = document.querySelector(`#${propsOptions.parentElementId} #progressBarValue`) as HTMLDivElement;
            progressBarValue.style.display = 'block';
            const snpashotTitle = document.querySelector(`#${propsOptions.parentElementId} .snapshot-title`) as HTMLDivElement;
            snpashotTitle.innerText = `${dateConvert}`;

            progressBarValue.style.left = leftValue;

            const playerWrap = document.querySelector(`#${propsOptions.parentElementId} .dms-player-wrap`) as HTMLDivElement;
            const playerWrapWitdh = playerWrap.clientWidth;
            const offsetLeft = progressBarValue.offsetLeft;
            const offsetHalfWidth = progressBarValue.offsetWidth / 2;

            if (offsetLeft <= offsetHalfWidth + 15) { // left end
                progressBarValue.style.left = `${offsetHalfWidth + 15}px`;
            } else if (offsetLeft >= (playerWrapWitdh - offsetHalfWidth - 15)) { // left end
                progressBarValue.style.left = `${playerWrapWitdh - offsetHalfWidth - 15}px`;
            }
        }
    };

    return (
        <div className="progress-bar" style={{paddingBottom: Object.keys(scaleArray)?.length > 0 ? '1em' : '0'}}>
            <div className="slider-container" aria-label="슬라이더 컨트롤 바">
                <div className="progress-bar-value" id="progressBarValue">
                    <div className="snapshot-wrap">
                        <div className="snapshot-content">
                            {
                                snapShotUrl 
                                    ? <img src={snapShotUrl} alt='스냅샷' />
                                    : null
                            }
                        </div>
                        <div className="snapshot-title"></div>
                    </div>
                </div>
                <Slider
                    value={playDate}
                    step={1}
                    min={propsOptions.startDate}
                    max={propsOptions.endDate}
                    marks={scaleArray}
                    onChange={(changeVal) => onChangeSlider(changeVal)}
                    onAfterChange={() => {onMouseOutSlider()}}
                />
            </div>
        </div>
    );
};