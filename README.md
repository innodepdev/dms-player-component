# [dms-player-component.js](https://innodep.co.kr/renew/)

[![npm version](https://img.shields.io/npm/v/dms-player-component.svg?style=flat-square)](https://www.npmjs.com/package/dms-player-component)
[![npm downloads](https://img.shields.io/npm/dm/dms-player-component.svg?style=flat-square)](https://www.npmjs.com/package/dms-player-component)
[![size](https://img.shields.io/bundlephobia/minzip/dms-player-component.svg?style=flat)](https://bundlephobia.com/result?p=dms-player-component)

dms-player-component 는 [**이노뎁(주)**](http://www.innodep.com/)의 [dms-player](https://www.npmjs.com/package/dms-player) 영상 연동 모듈을 활용한 preact 기반 컴포넌트 라이브러리 입니다.

## 🚩 Table of Contents
- [Install](#install)
- [Usage](#usage)

## Install

<PRE style="padding: 16px;overflow: auto;font-size: 85%;line-height: 1.45;background-color: #e2e2e2;border-radius: 3px;">
$ npm install --save dms-player-component # Latest Version
$ npm install --save dms-player-component@<version> # Specific Version
</PRE>

## Usage

- ES6 Modules
``` sh
import dmsPlayerComponent from 'dms-player-component';
```
- CommonJS
``` sh
const dmsPlayerComponent = require('dms-player-component');
```

```js
...
<body>
  ...
  <div id="player"></div> 
</body>
...

// create player component
const options1 = {
    parentElementId: 'player1',
    id: 'dms_video_1',
    url: 'vurix:///100869/1/0/0',
    protocol: 'http',
    host: 'ca-172-16-36-180.vurix.kr',
    transcode: 720
};

const playerInstance = new dmsPlayerComponent.Player(document.getElementById('player1'));
playerInstance.render(options1);
  
// remove player component
playerInstance.destroy();
```
### Common API

| Name         | Type    | Default | Description |
| ------------ | ------- | ------- | ----------- |
| parentElementId | string |  | video 태그가 위치 할 부모 `HTML Element ID` |
| id | string |  | 생성 대상 Player `ID` 지정 |
| url | string |  | vurix or realhub(원본소스타입) -> `///[vms_id]/[dev_serial]/[channel]/[media]`  |
| protocol | string |  | 프로토콜 정보, `http` or `https` |
| host | string |  | Host 정보, 접속 Host URL 또는 사용 할 Media Server Host URL |
| transcode | number |  | 인코딩 요청 값, `-1`=인코딩 적용 X, `0`=원본, `-1, 0을 제외한 최소 값은 32` |
| startDate | number |  | 저장 영상 요청 시작 `utc datetime` (실시간 재생 시 옵션 적용 X ) |
| endDate | number |  | 저장 영상 요청 종료 `utc datetime` (실시간 재생 시 옵션 적용 X )|
| autoPlay | boolean | `false` | 자동 재생 여부 |
| playSpeed | number | `1` | 저장 영상 배속 옵션, 해당 옵션이 없을 경우, 배속 버튼도 표시 되지 않으며 세가지 옵션 제공 `1, 2(2배속), 4(4배속)`
| capture | boolean | `false` | 화면 캡쳐 버튼 활성화 여부 |
| scale | number | | 저장영상 구간 눈금 표시 여부 및 눈금 표시 갯수 |
| buttonTooltip | boolean | `false` | 플레이어 컨트롤 영역 버튼 `Tooltip` 표시 여부 |
| errorMsgFunc | Function |  | 에러 발생 `콜백` 함수 |